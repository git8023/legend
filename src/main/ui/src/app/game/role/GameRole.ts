// 游戏角色
export class GameRole {
  // 名称
  name: string;
  // 图片资源
  pic: string;
  // 等级
  level: number;
  // 最大生命值
  maxHP: number;
  // 最大魔法值
  maxMP: number;
  // 速度
  speed: number;
  // 是否玩家
  isPlayer?: boolean;

  // 当前生命值
  currentHP?: number;
  // 当前魔法值
  currentMP?: number;
  // 最小攻击值
  attackMin: number;
  // 最大攻击值
  attackMax: number;
  // 最小防御
  defenseMin: number;
  // 最大防御
  defenseMax: number;
  static isLife = (role: GameRole) => role.currentHP > 0;

  constructor(
    name: string,
    pic: string,
    level: number,
    maxHP: number,
    maxMP: number,
    speed: number,
    attackMin: number,
    attackMax: number,
    defenseMin: number,
    defenseMax: number
  ) {
    this.name = name;
    this.pic = pic;
    this.level = level;
    this.currentHP = this.maxHP = maxHP;
    this.currentMP = this.maxMP = maxMP;
    this.speed = speed;
    this.attackMin = attackMin;
    this.attackMax = attackMax;
    this.defenseMin = defenseMin;
    this.defenseMax = defenseMax;
  }
}
