import {GameProp} from './GameProp';
import {copyProps, eachA, randA} from "../../common/utils";

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

  static of(o: Equipment | object): Equipment {
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
  equipments: Equipment[] = [];

  // 创建装备仓库
  static create(equipments: Equipment[]): EquipmentStore {
    let es: EquipmentStore = new EquipmentStore();
    // es.equipments = equipments;
    eachA(equipments, o => {
      let el = copyProps(o, new Equipment())
      es.equipments.push(el);
    });
    return es;
  }

  // 随机获取装备
  getRandom(): Equipment {
    let equipment = randA(this.equipments);
    return copyProps(equipment, new Equipment());
  }

}
