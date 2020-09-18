import {GameProp} from './GameProp';

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
