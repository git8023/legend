import {GameRole} from './GameRole';
import {eachA} from '../../common/utils';

// 等级经验
class LevelExp {
  // 当前等级
  level: number;

  // 当前经验
  currentExp: number;

  // 升级所需经验
  levelUpExp: number;

  // 属性成长值(浮点型)
  // 每次升级带来的属性增长:
  // 升级属性 *= 1 + attributeGrowth;
  attributeGrowth: number;

  // 经验增长值(浮点型)
  // levelUpExp *= (level - 1) + expGrowth
  expGrowth: number;

  // 创建等级经验实例
  static create(): LevelExp {
    let lvExp = new LevelExp();
    lvExp.level = 1;
    lvExp.attributeGrowth = 0.2;
    lvExp.expGrowth = 0.3;
    lvExp.currentExp = 0;
    lvExp.updateLevelUpExp();
    return lvExp;
  }

  // 计算升级所需经验
  private updateLevelUpExp() {
    this.levelUpExp = this.levelUpExp || 10;
    if (1 < this.level)
      this.levelUpExp = Math.ceil(this.levelUpExp * (this.level + this.expGrowth));
  }

  /**
   * 增加经验
   * @param exp 经验值
   * @returns true-已经升级, false-还没升级
   */
  addExp(exp: number): boolean {
    this.currentExp += Math.max(1, exp);
    let isUpgrade = false;
    if (this.levelUpExp <= this.currentExp) {
      this.currentExp -= this.levelUpExp;
      this.updateLevelUpExp();
      this.level++;
      isUpgrade = true;
    }
    return isUpgrade;
  }

  /**
   * 属性成长
   * @param base 基础值
   * @returns 成长后
   */
  upgradeAttribute(base: number): number {
    return Math.ceil(base * (1 + this.attributeGrowth));
  }
}

// 玩家
export class Player extends GameRole {

  exp: LevelExp = LevelExp.create();

  // 创建玩家数据
  static create(role: GameRole): Player {
    let player = new Player(
      role.name, role.pic,
      role.level, role.maxHP, role.maxMP, role.speed, role.attackMin,
      role.attackMax, role.defenseMin, role.defenseMax
    );
    player.isPlayer = true;
    return player;
  }

  // 计算玩家经验
  appendExp(exp: number) {
    let isUpLv: boolean = this.exp.addExp(exp);
    if (isUpLv)
      this.upgrade();
  }

  // 升级
  private upgrade() {
    this.maxHP = this.exp.upgradeAttribute(this.maxHP);
    this.maxMP = this.exp.upgradeAttribute(this.maxMP);
    this.attackMin = this.exp.upgradeAttribute(this.attackMin);
    this.attackMax = this.exp.upgradeAttribute(this.attackMax);
    this.defenseMin = this.exp.upgradeAttribute(this.defenseMin);
    this.defenseMax = this.exp.upgradeAttribute(this.defenseMax);
    this.level = this.exp.level;

    this.currentHP = this.maxHP;
    this.currentMP = this.maxMP;
  }
}

// 玩家管理
// 组队/帮派等
export class Players {
  private readonly current: Player;

  constructor() {
    this.current = Player.create({
      name: '七月',
      pic: '/assets/fight/headPic/player-1.png',
      level: 1,
      maxHP: 20,
      maxMP: 15,
      speed: 5,
      attackMin: 1,
      attackMax: 15,
      defenseMin: 1,
      defenseMax: 3,
    });
  }

  // 获取当前用户
  getCurrent(): Player {
    return this.current;
  }

  // 经验 = 怪物等级 / 玩家等级 + 怪物血量/10 + 玩家等级
  addExp(enemies: GameRole[]): number {
    let totalExp = 0;
    eachA(enemies, enemy => {
      let exp = Math.ceil(enemy.level / this.current.level + enemy.maxHP / 10 + (enemy.level - this.current.level));
      totalExp += Math.max(1, exp);
    });
    this.current.appendExp(totalExp);
    return totalExp;
  }
}

const players = new Players();
export {players};
