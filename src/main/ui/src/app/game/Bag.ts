import {GameProp} from './gameProp/GameProp';
import {concatA} from '../common/utils';
import {Equipment, EquipmentType} from "./gameProp/Equipment";
import {Player} from "./role/Player";

export class Bag {
  // 背包容量
  capacity: number;

  // 已使用数量
  usedCount: number = 0;

  // 道具列表
  props: GameProp[] = [];

  constructor(private player: Player, private cap: number = 20) {
    this.capacity = cap;
    this.usedCount = 0;
    this.props = [];

    // this.props.push(
    //   Equipment.of({
    //     name: '绯红铠甲1',
    //     pic: '/assets/img/equip/armour/02_01.png',
    //     note: '绯红宝石镶嵌的铠甲, 有着不菲防御',
    //     probability: 1,
    //     defenseMin: 1,
    //     defenseMax: 2,
    //     lv: 2,
    //     type: EquipmentType.ARMOUR
    //   }),
    //   Equipment.of({
    //     name: '绯红项链',
    //     pic: '/assets/img/equip/necklace/03_01.png',
    //     note: '绯红宝石镶嵌的项链',
    //     probability: 1,
    //     hp: 10,
    //     lv: 3,
    //     type: EquipmentType.NECKLACE
    //   }),
    //   Equipment.of({
    //     name: '绯红戒指',
    //     pic: '/assets/img/equip/ring/05_01.png',
    //     note: '绯红宝石镶嵌的项链',
    //     probability: 1,
    //     attackMin: 1,
    //     attackMax: 1,
    //     lv: 5,
    //     type: EquipmentType.RING
    //   }),
    //   Equipment.of({
    //     name: '绯红之靴',
    //     pic: '/assets/img/equip/shoe/04_01.png',
    //     note: '绯红宝石镶嵌的项链',
    //     probability: 1,
    //     speed: 1,
    //     defenseMin: 1,
    //     defenseMax: 2,
    //     lv: 4,
    //     type: EquipmentType.SHOE
    //   }),
    //   Equipment.of({
    //     name: '绯红之膝',
    //     pic: '/assets/img/equip/leg-guard/03_01.png',
    //     note: '绯红宝石镶嵌的项链',
    //     probability: 1,
    //     attackMin: 0,
    //     attackMax: 1,
    //     defenseMin: 1,
    //     defenseMax: 2,
    //     lv: 3,
    //     type: EquipmentType.LEG_GUARD
    //   }),
    //   Equipment.of({
    //     name: '绯红腰带',
    //     pic: '/assets/img/equip/belt/01_01.png',
    //     note: '绯红宝石镶嵌的项链',
    //     probability: 1,
    //     hp: 15,
    //     lv: 1,
    //     type: EquipmentType.BELT
    //   }),
    // );
    // let i = 36 - this.props.length;
    // while (--i >= 0) {
    //   this.props.push(Equipment.of(this.props[0]));
    // }

  }

  /**
   * 游戏道具加入背包
   * @param gameProps 道具列表
   * @returns 成功加入背包的道具数量, 从0~N
   */
  pull(gameProps: GameProp[]) {
    // 背包不允许超出最大数量: 36
    const MAX_COUNT = 36;
    let pushLen = MAX_COUNT - this.props.length;
    concatA(this.props, gameProps);
    while (this.props.length > MAX_COUNT) {
      this.props.pop();
    }
    return Math.min(pushLen, gameProps.length);
  }

  // 道具替换
  replace(index: number, oldProp?: GameProp) {
    if (oldProp)
      this.props.splice(index, 1, oldProp);
    else
      this.props.splice(index, 1);
  }
}
