import {GameProp} from './GameProp';
import {concatA, copyProps, eachA, eachO, groupA, randA} from "../../common/utils";

// 装备
export class Equipment extends GameProp {

  // 附加生命值
  hp?: number;

  // 附加魔法值
  mp?: number;

  // 附加速度
  speed?: number;

  // 附加最小攻击
  attackMin?: number;

  // 附加最大攻击
  attackMax?: number;

  // 附加最小防御
  defenseMin?: number;

  // 附加最大防御
  defenseMax?: number;

  // 装备类型
  type: EquipmentType;

  static of(o?: Equipment | object): Equipment {
    return copyProps(o, new Equipment());
  }
}

// 装备类型
export enum EquipmentType {
  // 头盔
  HELMET,
  // 铠甲
  ARMOUR,
  // 武器
  WEAPON,
  // 护腿
  LEG_GUARD,
  // 靴子
  SHOE,
  // 饰品
  NECKLACE,
  // 戒指
  RING,
  // 腰带
  BELT,
}

// 装备仓库
export class EquipmentStore {

  // 装备列表
  private static equipments: Equipment[] = [];

  // 按等级划分装备
  private static lvGroup: { [p: string]: Array<Equipment> };

  // 当前仓库中可以获取的
  private localEquipments: Equipment[] = [];

  // 初始化装备
  static init() {

    // 铠甲
    this.create([
      Equipment.of({
        name: '绯红铠甲',
        pic: '/assets/img/equip/armour/02_01.png',
        note: '绯红宝石镶嵌的铠甲, 有着不菲防御',
        probability: 0.01,
        defenseMin: 1,
        defenseMax: 2,
        lv: 2,
        type: EquipmentType.ARMOUR
      }),
      Equipment.of({
        name: '青铜铠甲',
        pic: '/assets/img/equip/armour/08_01.png',
        note: '经验老到的铁匠师傅选用常见的青铜锻造而成.',
        probability: 0.01,
        defenseMin: 1,
        defenseMax: 5,
        lv: 8,
        type: EquipmentType.ARMOUR
      }),
    ]);

    // 项链
    this.create([
      Equipment.of({
        name: '绯红项链',
        pic: '/assets/img/equip/necklace/03_01.png',
        note: '绯红宝石镶嵌的项链',
        probability: 0.01,
        hp: 10,
        lv: 3,
        type: EquipmentType.NECKLACE
      }),
      Equipment.of({
        name: '青铜项链',
        pic: '/assets/img/equip/necklace/08_01.png',
        note: '开光失败的精致铜铸项链.',
        probability: 0.01,
        hp: 12,
        lv: 8,
        type: EquipmentType.NECKLACE
      }),
    ]);

    // 戒指
    this.create([
      Equipment.of({
        name: '绯红戒指',
        pic: '/assets/img/equip/ring/05_01.png',
        note: '绯红宝石镶嵌的项链',
        probability: 0.01,
        attackMin: 1,
        attackMax: 1,
        lv: 5,
        type: EquipmentType.RING
      }),
      Equipment.of({
        name: '青铜戒指',
        pic: '/assets/img/equip/ring/08_01.png',
        note: '开光失败的精致铜铸戒指',
        probability: 0.01,
        attackMin: 0,
        attackMax: 2,
        lv: 8,
        type: EquipmentType.RING
      }),
    ]);

    // 靴子
    this.create([
      Equipment.of({
        name: '绯红之靴',
        pic: '/assets/img/equip/shoe/04_01.png',
        note: '绯红宝石镶嵌的靴子, 华而不实没啥实际用处',
        probability: 0.01,
        speed: 1,
        defenseMin: 1,
        defenseMax: 2,
        lv: 4,
        type: EquipmentType.SHOE
      }),
      Equipment.of({
        name: '青铜靴',
        pic: '/assets/img/equip/shoe/08_01.png',
        note: '开光失败的精致铜铸靴, 略重但防御力不错.',
        probability: 0.01,
        speed: -1,
        defenseMin: 0,
        defenseMax: 5,
        lv: 8,
        type: EquipmentType.SHOE
      }),
    ]);

    // 护膝
    this.create([
      Equipment.of({
        name: '绯红之膝',
        pic: '/assets/img/equip/leg-guard/03_01.png',
        note: '绯红宝石镶嵌的项链',
        probability: 0.01,
        attackMin: 0,
        attackMax: 1,
        defenseMin: 1,
        defenseMax: 2,
        lv: 3,
        type: EquipmentType.LEG_GUARD
      }),
      Equipment.of({
        name: '青铜护膝',
        pic: '/assets/img/equip/leg-guard/08_01.png',
        note: '经验老到的铁匠师傅选用常见的青铜锻造而成.',
        probability: 0.01,
        attackMin: 0,
        attackMax: 1,
        defenseMin: 0,
        defenseMax: 5,
        lv: 8,
        type: EquipmentType.LEG_GUARD
      }),
    ]);

    // 腰带
    this.create([
      Equipment.of({
        name: '绯红腰带',
        pic: '/assets/img/equip/belt/01_01.png',
        note: '绯红宝石镶嵌的项链',
        probability: 0.01,
        hp: 15,
        lv: 3,
        type: EquipmentType.BELT
      }),
      Equipment.of({
        name: '青铜腰带',
        pic: '/assets/img/equip/belt/08_01.png',
        note: '经验老到的铁匠师傅选用常见的青铜锻造而成.',
        probability: 0.01,
        hp: 20,
        lv: 8,
        type: EquipmentType.BELT
      }),
    ]);

    this.lvGroup = groupA(EquipmentStore.equipments, "lv");
  }

  // 创建装备仓库
  private static create(equipments: Equipment[]): EquipmentStore {
    let es: EquipmentStore = new EquipmentStore();
    eachA(equipments, o => {
      let el = copyProps(o, new Equipment())
      this.equipments.push(el);
    });
    return es;
  }

  // 按等级范围获取装备仓库
  static genByRange(min: number, max: number): EquipmentStore {
    let es = new EquipmentStore();
    eachO<Equipment[]>(this.lvGroup, (v, k) => {
      if (min <= k && k < max)
        concatA(es.localEquipments, v);
    });
    return es;
  }

  // 随机获取装备
  getRandom(): Equipment {
    return Equipment.of(randA(this.localEquipments));
  }
}

EquipmentStore.init();
