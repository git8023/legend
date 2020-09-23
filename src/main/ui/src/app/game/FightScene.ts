import {eachA, execMethod, MessageQueue, rand} from "../common/utils";
import {Message, Messages, MessageType} from "./Message";
import {GameRole} from './role/GameRole';
import {GameMap} from './GameMap';
import {Player, players} from './role/Player';
import {GameProp} from './gameProp/GameProp';
import {GamePropManager} from './gameProp/GamePropManager';
import {MasterRole} from './role/MasterRole';
import {Skill} from './skill/Skill';

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
  onManual?: (isManual: boolean) => void;
  // 产生/受到伤害
  onHurt?: (role: GameRole, harm: number) => void;
}

// 战斗场景管理
export class FightScene {

  // 战斗状态
  status: FightStatus = FightStatus.READY_FIGHT;
  // 当前玩家
  player: Player;
  // 敌人
  enemy: MasterRole;
  // 场景消息队列
  messageQueue: MessageQueue<Message> = new MessageQueue<Message>(10);
  // 战斗事件
  event: FightEvent = {};
  // 寻找敌人计时器
  private nextEnemiesTimer: any;
  // 回合计数器
  roundCounter: number = 1;
  // Buff列表
  buffSkills: Array<Skill> = [];

  constructor(private gameMap: GameMap) {
    this.player = players.getCurrent();

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

  // 执行普通攻击
  private doNormalAttack(fromRole: GameRole, toRole: GameRole) {
    if ((0 == fromRole.currentHP) || (0 == toRole.currentHP))
      return;

    let fromRoleAttack = rand(fromRole.attackMin, fromRole.attackMax);
    let toRoleDefense = rand(toRole.defenseMin, toRole.defenseMax);
    let harm = Math.max(fromRoleAttack - toRoleDefense, 0);
    this.onHurt(fromRole, toRole, harm);

    if (!toRole.currentHP)
      this.messageQueue.pull(Messages.dead(toRole));
  }

  // 收到伤害
  onHurt(fromRole: GameRole, toRole: GameRole, harm: number) {
    toRole.currentHP = Math.max(toRole.currentHP - harm, 0);

    this.messageQueue.pull({
      type: MessageType.ATTACKER,
      data: {
        fromRole: fromRole,
        toRole: toRole,
        harm: harm,
        extra: (0 == harm ? `${toRole.name}灵巧躲过攻击` : "")
      }
    });
    execMethod(this.event.onHurt, this, [toRole, harm]);
  }

  // 删除消息
  deleteMessage(msg: Message) {
    this.messageQueue.del(msg);
  }

  // 回合结束, 检查各个游戏角色状态
  roundOver() {
    setTimeout(() => {
      // 玩家失败
      if (FightScene.isDead(this.player)) {
        this.messageQueue.pull(Messages.lose(this.player));
        this.status = FightStatus.REJUVENATION;
        this.rejuvenation();
      }

      // 敌人失败
      else if (FightScene.isDead(this.enemy)) {
        this.messageQueue.pull(Messages.text('战斗胜利!'));
        execMethod(this.event.onLiquidation, null, [false]);
        this.liquidation();
        this.countdownNextEnemies();
      }

      // 继续下个回合
      else {
        this.roundCounter++;
        execMethod(this.event.onManual, null, [true]);
      }
    }, 500);
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
      this.countdownNextEnemies();
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
    execMethod(this.event.onManual, null, [false]);

    this.messageQueue.pull(Messages.waitEnemy('正在寻找敌人...'));
    let cd = 1;
    this.nextEnemiesTimer = setInterval(() => {
      if (cd-- <= 0) {
        clearInterval(this.nextEnemiesTimer);
        this.nextEnemies();
      }
    }, 1000);
  }

  // 下一波遇到的敌人
  nextEnemies() {
    // this.messageQueue.clear();
    this.enemy = this.gameMap.generateEnemy();
    this.enemy.currentHP = this.enemy.maxHP;
    this.enemy.currentMP = this.enemy.maxMP;
    this.messageQueue.pull(Messages.encounterEnemy([this.enemy]));
    execMethod(this.event.onFindEnemy, null, [[this.enemy]]);
    this.fightStart();
  }

  // 结算
  private liquidation() {
    this.messageQueue.pull(Messages.text('正在结算...'));
    let enemies = [this.enemy];
    let exp = players.addExp(enemies);
    this.messageQueue.pull(Messages.liquidation(`经验+${exp}`));

    let gameProps: GameProp[] = GamePropManager.gatherGameProp(enemies, this.gameMap);
    this.player.bag.pull(gameProps);
    gameProps.forEach(prop => this.messageQueue.pull(Messages.gatherGameProp(prop)))

  }

  // 普通防御
  normalDefense() {
    execMethod(this.event.onRoundStart, this);
    execMethod(this.event.onManual, null, [false]);

    this.doNormalDefense(this.enemy, this.player);
    this.fightOver();
  }

  // 攻击 => 防御
  // 防御方使用最大防御值
  private doNormalDefense(attackRole: GameRole, defenseRole: GameRole) {
    if ((0 == attackRole.currentHP) || (0 == defenseRole.currentHP))
      return;
    this.messageQueue.pull(Messages.defense(defenseRole));

    let fromRoleAttack = rand(attackRole.attackMin, attackRole.attackMax);
    let harm = Math.max(fromRoleAttack - defenseRole.defenseMax, 0);
    this.onHurt(attackRole, defenseRole, harm);

    if (!defenseRole.currentHP)
      this.messageQueue.pull(Messages.dead(defenseRole));
  }

  // 当前玩家逃跑
  playerEscape() {
    execMethod(this.event.onManual, null, [false]);

    // 30%几率逃跑失败
    // 逃跑成功
    if (0.3 > Math.random()) {
      this.messageQueue.pull(Messages.escape(this.player, true));
      this.rejuvenation();
      return;
    }

    // 逃跑失败受到1.5倍伤害
    else {
      this.doEscapeFailure(this.enemy, this.player);
      this.roundOver();
    }
  }

  // 逃跑失败收到惩罚
  // 逃跑失败受到1.5倍伤害
  private doEscapeFailure(attackRole: GameRole, defenseRole: GameRole) {
    if ((0 == attackRole.currentHP) || (0 == defenseRole.currentHP))
      return;
    this.messageQueue.pull(Messages.escape(this.player, false));

    let fromRoleAttack = rand(attackRole.attackMin, attackRole.attackMax);
    let harm = Math.ceil(Math.max(fromRoleAttack, 1) * 1.5);

    defenseRole.currentHP = Math.max(defenseRole.currentHP - harm, 0);
    this.messageQueue.pull({
      type: MessageType.ATTACKER,
      data: {
        fromRole: attackRole,
        toRole: defenseRole,
        harm: harm,
        extra: (0 == harm ? `${defenseRole.name}灵巧躲过攻击` : "")
      }
    });

    if (!defenseRole.currentHP)
      this.messageQueue.pull(Messages.dead(defenseRole));
  }

  // 玩家使用技能
  playerUseSkill(key: string) {
    execMethod(this.event.onRoundStart, this);
    execMethod(this.event.onManual, null, [false]);

    let skill = this.player.skillStore.shortcut[key];
    skill.use(this);
    eachA(this.getEnemies(), e => this.doNormalAttack(e, this.player));
    this.fightOver();
  }

  // 获取所有敌人
  getEnemies() {
    return [this.enemy];
  }

  // 获取角色防御值
  getDefense(role: GameRole): number {
    return rand(role.defenseMin, role.defenseMax + 1);
  }

  // 收到消息
  onMessage(msg: Message) {
    this.messageQueue.pull(msg);
  }

  // 增加Buff
  addBuff(skill: Skill) {
    this.buffSkills.push(skill);
  }
}
