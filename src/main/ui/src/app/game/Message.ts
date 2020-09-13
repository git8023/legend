// 消息类型
import {GameRole} from "./FightScene";

export enum MessageType {
  // 普通文本消息
  TEXT,

  // 战斗消息
  FIGHT,
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
  extra?: string;
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

  /**
   * 创建角色死亡消息
   * @param role 游戏角色
   */
  static dead(role: GameRole): Message {
    return {type: MessageType.TEXT, data: {extra: `${role.name}已死亡!!!`}};
  }
}
