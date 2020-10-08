import {eachA, execMethod, MessageQueue, rand, randA} from "../common/utils";
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
  // 结算中
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
  // enemy: MasterRole;
  enemies: MasterRole[];
  // 场景消息队列
  messageQueue: MessageQueue<Message> = new MessageQueue<Message>(5);
  // 战斗事件
  event: FightEvent = {};
  // 寻找敌人计时器
  private nextEnemiesTimer: any;
  // 回合计数器
  roundCounter: number = 1;
  // Buff列表
  buffSkills: Map<Skill, number> = new Map<Skill, number>();

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
    let enemy = randA(this.enemies.filter(GameRole.isLife));

    // 计算出手速度
    if (this.player.speed >= enemy.speed) {
      // 玩家普通攻击
      this.doNormalAttack(this.player, enemy);
      // 敌人攻击
      setTimeout(() => {
        eachA(
          this.enemies.filter(GameRole.isLife),
          enemy => this.doNormalAttack(enemy, this.player)
        );
        this.fightOver();
      }, 500);
      return;
    }

    // 玩家普通攻击
    setTimeout(() => {
      this.doNormalAttack(this.player, enemy);
      this.fightOver();
    }, 500);
    // 敌人攻击
    eachA(this.enemies, enemy => this.doNormalAttack(enemy, this.player));
  }

  // 执行普通攻击
  private doNormalAttack(fromRole: GameRole, toRole: GameRole) {
    if ((0 == fromRole.currentHP) || (0 == toRole.currentHP))
      return;

    let fromRoleAttack = rand(fromRole.attackMin, fromRole.attackMax);
    let toRoleDefense = this.getDefense(toRole);
    let harm = Math.max(fromRoleAttack - toRoleDefense, 0);
    this.onHurt(fromRole, toRole, harm);

    if (!toRole.currentHP)
      this.messageQueue.pull(Messages.dead(toRole));
  }

  // 受到伤害
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
      else if (FightScene.isDead(...this.enemies)) {
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
  private static isDead(...roles: GameRole[]) {
    for (let i in roles)
      if (0 < roles[i].currentHP)
        return false;
    return true;
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

    let avgHp = this.player.maxHP / 10;
    let avgMp = this.player.maxMP / 10;
    setTimeout(() => {
      let hp = this.player.currentHP + avgHp;
      let mp = this.player.currentMP + avgMp;
      this.player.currentHP = Math.min(hp, this.player.maxHP);
      this.player.currentMP = Math.min(mp, this.player.maxMP);
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
    this.messageQueue.clear();
    this.genEnemies();
    this.messageQueue.pull(Messages.encounterEnemy(this.enemies));
    execMethod(this.event.onFindEnemy, null, [this.enemies]);
    this.fightStart();
  }

  // 生成敌人
  private genEnemies() {
    this.enemies = [];

    // 10%概率遇到3个敌人
    let total;
    let probability = Math.random();
    if (0.1 >= probability) {
      total = 3;
    }
    // 30%概率遇到2个敌人
    else if (0.3 >= probability) {
      total = 2;
    }
    // 100%概率遇到1个敌人
    else {
      total = 1;
    }

    while (--total >= 0) {
      let enemy = this.gameMap.generateEnemy();
      enemy.currentHP = enemy.maxHP;
      enemy.currentMP = enemy.maxMP;
      this.enemies.push(enemy);
    }
  }

  // 结算
  private liquidation() {
    this.messageQueue.pull(Messages.text('正在结算...'));
    let exp = players.addExp(this.enemies);
    this.messageQueue.pull(Messages.liquidation(`经验+${exp}`));

    let gameProps: GameProp[] = GamePropManager.gatherGameProp(this.enemies, this.gameMap);
    let pushCount = this.player.bag.pull(gameProps);
    let missProps = gameProps.splice(pushCount);
    gameProps.forEach(prop => this.messageQueue.pull(Messages.gatherGameProp(prop)));
    if (missProps.length > 0) {
      missProps.forEach(prop => this.messageQueue.pull(Messages.text(`遗失的道具 <span class="color-green">${prop.name}</span>`)));
    }

    execMethod(this.event.onLiquidation, null, [true]);
  }

  // 普通防御
  normalDefense() {
    execMethod(this.event.onRoundStart, this);
    execMethod(this.event.onManual, null, [false]);
    eachA(
      this.enemies.filter(GameRole.isLife),
      enemy => this.doNormalDefense(enemy, this.player)
    );
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
      eachA(this.enemies, enemy => this.doEscapeFailure(enemy, this.player));
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
    this.enemiesAttack();
    this.fightOver();
  }

  // 敌人进攻
  private enemiesAttack() {
    eachA(
      this.enemies.filter(GameRole.isLife),
      e => this.doNormalAttack(e, this.player)
    );
  }

  // 获取所有敌人
  getEnemies() {
    return this.enemies;
  }

  // 获取角色防御值
  getDefense(role: GameRole): number {
    let extraDefenseMax = 0;

    let expiredSkills: Array<Skill> = [];
    for (const sk of this.buffSkills.keys()) {
      extraDefenseMax += (sk.extra.defenseMax || 0);
      let keep = this.buffSkills.get(sk) - 1;
      if (0 > keep)
        expiredSkills.push(sk);
      this.buffSkills.set(sk, keep);
    }
    eachA(expiredSkills, sk => {
      this.onMessage(Messages.text(`${sk.name} Buff消失.`));
      this.buffSkills.delete(sk);
    });

    return rand(role.defenseMin, role.defenseMax + 1) + extraDefenseMax;
  }

  // 收到消息
  onMessage(msg: Message) {
    this.messageQueue.pull(msg);
  }

  // 增加Buff
  addBuff(skill: Skill, keep: number) {
    this.buffSkills.set(skill, keep);
  }

  // 获取基础攻击值
  getAttack(role: GameRole): number {
    return rand(role.attackMin, role.attackMax);
  }

  // 获取活着的敌人
  getLifeEnemies(): MasterRole[] {
    return this.enemies.filter(MasterRole.isLife);
  }

  // 同步场景数据
  sync() {
    execMethod(this.event.onFindEnemy, null, [this.enemies]);
    // TODO 本次战斗结束后切换地图
    // 如果直接切换地图可能造成低等级区域敌人爆出高等级地图装备
  }
}
