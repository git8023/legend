import {GameProp} from './gameProp/GameProp';
import {concatA, findA} from '../common/utils';

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
  }

  // 游戏道具加入背包
  pull(gameProps: GameProp[]) {
    concatA(this.props, gameProps);
  }
}
