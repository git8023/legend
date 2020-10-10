import {GameProp} from './GameProp';
import {MasterRole} from '../role/MasterRole';
import {GameMap} from "../GameMap";
import {EquipmentStore} from "./Equipment";
import {eachA, forEachMap, rand} from "../../common/utils";
import {isNotNullOrUndefined} from 'codelyzer/util/isNotNullOrUndefined';

export class GamePropManager {

  /**
   * 爆装备: 从怪物中获取道具
   * @param enemies 怪物列表
   * @param gameMap 装备库
   */
  static gatherGameProp(enemies: MasterRole[], gameMap: GameMap): GameProp[] {
    // 地图中装备总爆率
    if (Math.random() > gameMap.probability)
      return [];

    // 爆装备的数量在 1 ~ enemies.length*1.5 之间
    let propCount = rand(1, Math.ceil(enemies.length * 1.5));

    // 装备等级不能超过敌人等级
    enemies = enemies.sort((a, b) => b.level - a.level);
    let maxLv = enemies[enemies.length - 1].level;
    return forEachMap<GameProp>(() => {
      return gameMap.equipments.getRandomByLevelRange(gameMap.levelRange.min, maxLv);
    }, propCount);
  }
}
