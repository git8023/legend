// 消息类型
import {GameRole} from './role/GameRole';
import {GameProp} from './gameProp/GameProp';

export enum MessageType {
  // 普通文本消息
  TEXT,

  // 发起进攻
  ATTACKER,

  // 结算
  LIQUIDATION,

  // 主动防御
  DEFENSE,

  // 遇敌
  ENCOUNTER_ENEMY,

  // 获得道具
  GATHER_GAME_PROP,
}

// 战斗数据消息
export interface FightMessageData {
  // 发起攻击方
  fromRole?: GameRole;
  // 受到攻击方
  toRole?: GameRole;
  // 伤害值
  harm?: number;
  // 技能名称, 普通攻击留空
  skill?: string;
  // 额外消息
  extra?: any;
  // 道具
  // Key: 数量
  // Value: 道具列表, 每个道具都有相同数量
  gameProp?: GameProp;
}

// 游戏消息接口
export interface Message {
  // 消息类型
  type: MessageType;
  // 消息数据
  data: FightMessageData;
}

// 游戏消息库
export class Messages {

  // 创建角色死亡消息
  static dead(role: GameRole): Message {
    return this.text(`${role.name}已死亡!!!`);
  }

  // 战斗失败
  static lose(role: GameRole): Message {
    return this.text(`战斗失败活力恢复中...`);
  }

  // 文本消息
  static text(extra: string): Message {
    return {type: MessageType.TEXT, data: {extra: extra}};
  }

  // 结算消息
  static liquidation(extra: string): Message {
    return {type: MessageType.LIQUIDATION, data: {extra: extra}};
  }

  // 防御消息
  static defense(role: GameRole): Message {
    return {type: MessageType.DEFENSE, data: {fromRole: role}};
  }

  // 遇敌消息
  static encounterEnemy(enemies: GameRole[]): Message {
    return {type: MessageType.ENCOUNTER_ENEMY, data: {extra: enemies}};
  }

  // 逃跑
  static escape(role: GameRole, success: boolean): Message {
    if (success)
      return this.text(`${role.name} 逃跑成功, 活力恢复中...`);
    return this.text(`${role.name} 逃跑失败! 受到背击造成1.5倍伤害.`);
  }

  // 获取游戏道具
  static gatherGameProp(prop: GameProp): Message {
    return {type: MessageType.GATHER_GAME_PROP, data: {gameProp: prop}};
  }
}

