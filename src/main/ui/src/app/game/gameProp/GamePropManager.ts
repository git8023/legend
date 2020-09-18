import {GameProp} from './GameProp';
import {MasterRole} from '../role/MasterRole';
import {GameMap} from "../GameMap";
import {EquipmentStore} from "./Equipment";
import {forEachMap, rand} from "../../common/utils";

export class GamePropManager {

  /**
   * 爆装备: 从怪物中获取道具
   * @param enemies 怪物列表
   * @param gameMap 装备库
   */
  static gatherGameProp(enemies: MasterRole[], gameMap: GameMap): GameProp[] {
    if (Math.random() <= gameMap.probability)
      return forEachMap<GameProp>(() => gameMap.equipments.getRandom(), rand(1, enemies.length));
    return [];
  }
}
