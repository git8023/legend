import {GameProp} from './GameProp';
import {cloneType, copyProps, eachA, randA} from "../../common/utils";

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
