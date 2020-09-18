import {GameProp} from './gameProp/GameProp';
import {concatA, findA} from '../common/utils';
import {Equipment} from "./gameProp/Equipment";

export class Bag {
  // 背包容量
  capacity: number;

  // 已使用数量
  usedCount: number = 0;

  // 道具列表
  props: GameProp[] = [];

  /**
   * @param [cap=20] 背包容量
   */
  constructor(private cap: number = 20) {
    this.capacity = cap;
    this.usedCount = 0;
    this.props = [];

    this.props.push(
      <Equipment>{
        name: '绯红铠甲1',
        pic: '/assets/equip/armour/02_01.png',
        note: '绯红宝石镶嵌的铠甲, 有着不菲防御',
        probability: 1,
        defenseMin: 1,
        defenseMax: 2
      },
      <Equipment>{
        name: '绯红项链',
        pic: '/assets/equip/necklace/03_01.png',
        note: '绯红宝石镶嵌的项链',
        probability: 1,
        defenseMin: 1,
        defenseMax: 2
      },
      <Equipment>{
        name: '绯红戒指',
        pic: '/assets/equip/ring/05_01.png',
        note: '绯红宝石镶嵌的项链',
        probability: 1,
        defenseMin: 1,
        defenseMax: 2
      },
      <Equipment>{
        name: '绯红之靴',
        pic: '/assets/equip/shoe/04_01.png',
        note: '绯红宝石镶嵌的项链',
        probability: 1,
        defenseMin: 1,
        defenseMax: 2
      },
      <Equipment>{
        name: '绯红之膝',
        pic: '/assets/equip/leg-guard/03_01.png',
        note: '绯红宝石镶嵌的项链',
        probability: 1,
        defenseMin: 1,
        defenseMax: 2
      },
      <Equipment>{
        name: '绯红之膝',
        pic: '/assets/equip/belt/01_01.png',
        note: '绯红宝石镶嵌的项链',
        probability: 1,
        defenseMin: 1,
        defenseMax: 2
      },
    );
  }

  // 游戏道具加入背包
  pull(gameProps: GameProp[]) {
    concatA(this.props, gameProps);
  }
}
