import {execMethod, MessageQueue, rand} from "../common/utils";
import {Message, Messages, MessageType} from "./Message";
import {GameRole} from './role/GameRole';
import {GameMap} from './GameMap';
import {Player} from './role/Player';

// 战斗状态
export enum FightStatus {
  /** 准备进攻 */
  READY_FIGHT,
  /** 攻击中 */
  FIGHTING,
  /** 回合结束 */
  ROUND_OVER,
  /** 角色已死亡, 正在恢复活力 */
  REJUVENATION
}

// 战斗事件
export interface FightEvent {
  // 战斗开始
  onStart?: () => void;
  // 回合开始
  onRoundStart?: () => void;
  // 回合结束
  onRoundOver?: () => void;
  // 角色死亡恢复中
  onRejuvenation?: () => void;
  // 正在寻找敌人
  onFindEnemy?: (enemies: GameRole[]) => void;
  // 计算中
  onLiquidation?: (isDone: boolean) => void;
  // 操作类型
  onManual?: (isManual: boolean) => any;
}

// 战斗场景管理
export class FightScene {

  // 战斗状态
  status: FightStatus = FightStatus.READY_FIGHT;
  // 敌人
  enemy: GameRole;
  // 场景消息队列
  messageQueue: MessageQueue<Message> = new MessageQueue<Message>(20);
  // 战斗事件
  event: FightEvent = {};
  // 寻找敌人计时器
  private nextEnemiesTimer: any;
  // 回合计数器
  roundCounter: number = 1;

  constructor(private gameMap: GameMap, private player: Player) {
    this.player.currentHP = this.player.maxHP;
    this.player.currentMP = this.player.maxMP;
  }

  // 设置战斗事件
  fightEvent(event: FightEvent) {
    this.event = event || {};
  }

  // 玩家使用普通攻击
  normalAttack() {
    execMethod(this.event.onRoundStart, this);
    execMethod(this.event.onManual, null, [false]);

    // 计算出手速度
    if (this.player.speed >= this.enemy.speed) {
      // 玩家普通攻击
      this.doNormalAttack(this.player, this.enemy);
      // 敌人攻击
      setTimeout(() => {
        this.doNormalAttack(this.enemy, this.player);
        this.fightOver();
      }, 500);
      return;
    }

    // 玩家普通攻击
    setTimeout(() => {
      this.doNormalAttack(this.player, this.enemy);
      this.fightOver();
    }, 500);
    // 敌人攻击
    this.doNormalAttack(this.enemy, this.player);
  }

  // 玩家执行普通攻击
  private doNormalAttack(fromRole: GameRole, toRole: GameRole) {
    if ((0 == fromRole.currentHP) || (0 == toRole.currentHP)) {
      return;
    }

    let fromRoleAttack = rand(fromRole.attackMin, fromRole.attackMax);
    let toRoleDefense = rand(toRole.defenseMin, toRole.defenseMax);
    let harm = Math.max(fromRoleAttack - toRoleDefense, 0);
    toRole.currentHP = Math.max(toRole.currentHP - harm, 0);
    this.messageQueue.pull({
      type: MessageType.FIGHT,
      data: {
        fromRole: fromRole,
        toRole: toRole,
        harm: harm,
        extra: (0 == harm ? `${toRole.name}灵巧躲过攻击` : "")
      }
    });

    if (!toRole.currentHP)
      this.messageQueue.pull(Messages.dead(toRole));
  }

  // 删除消息
  deleteMessage(msg: Message) {
    this.messageQueue.del(msg);
  }

  // 回合结束, 检查各个游戏角色状态
  roundOver() {
    // 玩家失败
    if (FightScene.isDead(this.player)) {
      this.messageQueue.pull(Messages.lose(this.player));
      this.status = FightStatus.REJUVENATION;
      this.rejuvenation();
    }

    // 敌人失败
    else if (FightScene.isDead(this.enemy)) {
      this.messageQueue.pull(Messages.text('战斗胜利, ^o^Y!'));
      execMethod(this.event.onLiquidation, null, [false]);
      this.liquidation();
      this.countdownNextEnemies();

    }

    // 继续下个回合
    else {
      this.roundCounter++;
      execMethod(this.event.onManual, null, [true]);
    }
  }

  // 判断角色是否死亡
  private static isDead(role: GameRole) {
    return 0 == role.currentHP;
  }

  // 战斗开始
  private fightStart() {
    this.roundCounter = 1;
    this.status = FightStatus.FIGHTING;
    execMethod(this.event.onStart, this);
    execMethod(this.event.onManual, null, [true]);
  }

  // 战斗结束
  private fightOver() {
    this.status = FightStatus.ROUND_OVER;
    this.roundOver();
    execMethod(this.event.onRoundOver, this);
  }

  // 角色死亡活力恢复
  private rejuvenation() {
    if (this.player.maxHP == this.player.currentHP) {
      return;
    }

    let avg = this.player.maxHP / 10;
    setTimeout(() => {
      let hp = this.player.currentHP + avg;
      this.player.currentHP = Math.min(hp, this.player.maxHP);
      execMethod(this.event.onRejuvenation);

      if (hp < this.player.maxHP) {
        this.rejuvenation();
      } else {
        this.countdownNextEnemies();
      }
    }, 1000);
  }

  // 倒计时寻找下个敌人
  countdownNextEnemies() {
    execMethod(this.event.onLiquidation);

    let cd = 5;
    this.nextEnemiesTimer = setInterval(() => {
      if (cd <= 0) {
        this.nextEnemies();
        clearInterval(this.nextEnemiesTimer);
        return;
      }
      this.messageQueue.pull(Messages.text('正在寻找敌人 ' + cd));
      cd--;
    }, 1000);
  }

  // 下一波遇到的敌人
  nextEnemies() {
    this.messageQueue.clear();
    this.enemy = this.gameMap.generateEnemy();
    this.enemy.currentHP = this.enemy.maxHP;
    this.enemy.currentMP = this.enemy.maxMP;
    this.messageQueue.pull(Messages.text(`遇到 ${this.enemy.name}*1, 准备战斗!`));
    execMethod(this.event.onFindEnemy, null, [[this.enemy]]);
    this.fightStart();
  }

  // 结算
  private liquidation() {
    this.messageQueue.pull(Messages.text('正在结算...'));

    // 经验 = 怪物等级 / 玩家等级 + 怪物血量/10 + 玩家等级
    let exp = this.enemy.level / this.player.level + this.enemy.maxHP / 10 + this.player.level;
    this.player.appendExp(exp);
    this.messageQueue.pull(Messages.liquidation(`经验+${exp}`));

  }
}
