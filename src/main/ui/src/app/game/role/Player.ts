import {GameRole} from './GameRole';
import {clone, eachA, eachO} from '../../common/utils';
import {Bag} from '../Bag';
import {Equipment, EquipmentType} from "../gameProp/Equipment";

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

  // 当前玩家
  private player: Player;

  // 创建等级经验实例
  static create(player: Player): LevelExp {
    let lvExp = new LevelExp();
    lvExp.player = player;
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

  /**
   * 已获取经验距离升级经验百分比: [0~100)
   */
  expPercent(): number {
    return this.currentExp / this.levelUpExp * 100;
  }
}

// 玩家
export class Player extends GameRole {

  exp: LevelExp;
  bag: Bag;
  equipments: PlayerEquipments;

  // 创建玩家数据
  static create(role: GameRole): Player {
    let player = new Player(
      role.name, role.pic,
      role.level, role.maxHP, role.maxMP, role.speed, role.attackMin,
      role.attackMax, role.defenseMin, role.defenseMax
    );
    player.isPlayer = true;
    player.bag = new Bag(player);
    player.equipments = new PlayerEquipments(player);
    player.exp = LevelExp.create(player);
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

// 玩家穿戴装备管理
export class PlayerEquipments {

  // 装备可以影响的玩家属性
  static propsMap = {
    hp: 'maxHP',
    mp: 'maxMP',
    speed: 'speed',
    attackMin: 'attackMin',
    attackMax: 'attackMax',
    defenseMin: 'defenseMin',
    defenseMax: 'defenseMax',
  };

  // 属性中文名
  static propsCnNames = {
    maxHP: '生命',
    maxMP: '魔法',
    speed: '速度',
    attackMin: '最小攻击',
    attackMax: '最大攻击',
    defenseMin: '最小防御',
    defenseMax: '最大防御',
  }
  equipments: { [n: number]: Equipment } = {};

  constructor(private player: Player) {
  }

  // 换装
  replace(newly: Equipment): Equipment {

    // 换装
    let old = this.equipments[newly.type];
    this.equipments[newly.type] = newly;

    // 重新计算属性
    eachO<number>(PlayerEquipments.propsMap, (playerKey, equipmentKey) => {
      if (old)
        this.player[playerKey] -= (old[equipmentKey] || 0);
      this.player[playerKey] += (newly[equipmentKey] || 0);
    });

    return old;
  }

  // 装备附加值
  getWorth(): EquipmentWorth {
    let ew = new EquipmentWorth();
    eachO<Equipment>(this.equipments, prop => eachO(prop, (v, k) => {
      ew[k] = (ew[k] || 0) + (v || 0);
    }));
    return ew;
  }
}

// 装备总附加值
export class EquipmentWorth extends Equipment {
  constructor() {
    super();
    eachO(this, (v, k) => this[k] = 0);
    this.type = null;
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
      attackMin: 5,
      attackMax: 25,
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
    totalExp = Math.ceil(totalExp);
    this.current.appendExp(totalExp);
    return totalExp;
  }
}

const players = new Players();
export {players};
