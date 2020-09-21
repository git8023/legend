import {MasterRole} from './role/MasterRole';
import {randA} from '../common/utils';
import {EquipmentStore, EquipmentType} from './gameProp/Equipment';

export interface GameMap {
  // ID
  id: number;

  // 名称
  name: string;

  // 中文名称
  cnName: string;

  // (文字)中心点
  pointCenter: { x: number, y: number };

  // 等级范围
  levelRange: { min: number, max: number };

  // 是否能遇到敌人
  isSafeArea?: boolean;

  // 敌人列表
  enemies?: MasterRole[];

  // 本地图装备列表
  equipments?: EquipmentStore;

  // 遭遇Boss概率(0~1)
  bossRate?: number;

  // 生成敌人
  generateEnemy?: () => MasterRole;

  // 道具总爆率(n%)
  probability?: number
}

let xingZiLin: GameMap = {
  id: 0,
  name: 'XING_ZI_LIN',
  cnName: '杏子林',
  pointCenter: {x: 267, y: 360},
  levelRange: {min: 0, max: 9},
  enemies: [
    MasterRole.of({
      name: '毒蜘蛛',
      pic: '/assets/fight/master/du_zhi_zhu.png',
      level: 1,
      maxHP: 10,
      maxMP: 5,
      speed: 3,
      attackMin: 1,
      attackMax: 3,
      defenseMin: 0,
      defenseMax: 1,
    }),
    MasterRole.of({
      name: '野猪',
      pic: '/assets/fight/master/wild_pig.png',
      level: 1,
      maxHP: 12,
      maxMP: 5,
      speed: 1,
      attackMin: 1,
      attackMax: 2,
      defenseMin: 0,
      defenseMax: 1,
    }),
    MasterRole.ofBoss({
      name: '小陆龟',
      pic: '/assets/fight/master/tortoise.png',
      level: 2,
      maxHP: 15,
      maxMP: 1,
      speed: 0,
      attackMin: 1,
      attackMax: 3,
      defenseMin: 2,
      defenseMax: 5
    }),
    MasterRole.ofBoss({
      name: '小树妖',
      pic: '/assets/fight/master/dryad.png',
      level: 2,
      maxHP: 15,
      maxMP: 1,
      speed: 2,
      attackMin: 1,
      attackMax: 5,
      defenseMin: 1,
      defenseMax: 3
    }),
    MasterRole.ofBoss({
      name: '野猪王',
      pic: '/assets/fight/master/wild_pig_king.png',
      level: 5,
      maxHP: 35,
      maxMP: 10,
      speed: 5,
      attackMin: 3,
      attackMax: 7,
      defenseMin: 2,
      defenseMax: 5
    }),
  ],
  equipments: EquipmentStore.create([
    {
      name: '绯红铠甲',
      pic: '/assets/equip/armour/02_01.png',
      note: '绯红宝石镶嵌的铠甲, 有着不菲防御',
      lv: 2,
      probability: 0.1,
      defenseMin: 1,
      defenseMax: 2,
      type: EquipmentType.ARMOUR
    }
  ]),
  bossRate: 10 / 100,
  probability: 1,
  generateEnemy: function () {
    while (true) {
      let master = randA<MasterRole>(this.enemies);
      if (!master.isBoss)
        return master;

      if (Math.random() <= this.bossRate)
        return master;
    }
  }
};

const GameMaps = {
  JING_CHENG: <GameMap>{
    id: 0,
    name: 'JING_CHENG',
    cnName: '京城',
    pointCenter: {x: 575, y: 415},
    levelRange: {min: 0, max: 100},
    isSafeArea: true
  },
  CHEN_XI_CAO_YUAN: <GameMap>{
    id: 0,
    name: 'CHEN_XI_CAO_YUAN',
    cnName: '晨曦草原',
    pointCenter: {x: 596, y: 568},
    levelRange: {min: 25, max: 35}
  },
  NAN_JIANG: <GameMap>{
    id: 0,
    name: 'NAN_JIANG',
    cnName: '南疆',
    pointCenter: {x: 745, y: 580},
    levelRange: {min: 30, max: 45}
  },
  MING_SHA_HUANG_MO: <GameMap>{
    id: 0,
    name: 'MING_SHA_HUANG_MO',
    cnName: '鸣沙荒漠',
    pointCenter: {x: 880, y: 560},
    levelRange: {min: 45, max: 60}
  },
  BING_DAO: <GameMap>{
    id: 0,
    name: 'BING_DAO',
    cnName: '冰岛',
    pointCenter: {x: 870, y: 320},
    levelRange: {min: 20, max: 50}
  },
  HUO_DAP: <GameMap>{
    id: 0,
    name: 'HUO_DAP',
    cnName: '火岛',
    pointCenter: {x: 663, y: 200},
    levelRange: {min: 30, max: 70}
  },
  LAO_YIN_TA: <GameMap>{
    id: 0,
    name: 'LAO_YIN_TA',
    cnName: '烙印塔',
    pointCenter: {x: 505, y: 270},
    levelRange: {min: 30, max: 50}
  },
  BA_LI_ZHUANG: <GameMap>{
    id: 0,
    name: 'BA_LI_ZHUANG',
    cnName: '八里庄',
    pointCenter: {x: 372, y: 230},
    levelRange: {min: 5, max: 15}
  },
  SHI_BA_LI_PU: <GameMap>{
    id: 0,
    name: 'SHI_BA_LI_PU',
    cnName: '十八里铺',
    pointCenter: {x: 440, y: 450},
    levelRange: {min: 10, max: 20}
  },
  XING_ZI_LIN: xingZiLin,
  QI_XIA_ZHEN: <GameMap>{
    id: 0,
    name: 'QI_XIA_ZHEN',
    cnName: '七侠镇',
    pointCenter: {x: 290, y: 550},
    levelRange: {min: 15, max: 25}
  },
  WU_BA_GANG: <GameMap>{
    id: 0,
    name: 'WU_BA_GANG',
    cnName: '五霸岗',
    pointCenter: {x: 440, y: 590},
    levelRange: {min: 20, max: 30}
  },
  DUAN_HAI_ZHI_YUAN: <GameMap>{
    id: 0,
    name: 'DUAN_HAI_ZHI_YUAN',
    cnName: '断海之渊',
    pointCenter: {x: 90, y: 180},
    levelRange: {min: 70, max: 90}
  },
  JI_FENG_BI_AN: <GameMap>{
    id: 0,
    name: 'JI_FENG_BI_AN',
    cnName: '疾风彼岸',
    pointCenter: {x: 150, y: 50},
    levelRange: {min: 90, max: 100}
  },
  MO_YI_SHAN_GU: <GameMap>{
    id: 0,
    name: 'MO_YI_SHAN_GU',
    cnName: '魔裔山谷',
    pointCenter: {x: 80, y: 620},
    levelRange: {min: 50, max: 80}
  },
};

export {GameMaps};
