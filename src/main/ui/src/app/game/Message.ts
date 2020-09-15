// 消息类型
import {GameRole} from './role/GameRole';

export enum MessageType {
  // 普通文本消息
  TEXT,

  // 战斗消息
  FIGHT,

  // 结算
  LIQUIDATION
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
    return this.text(`${role.name}已死亡!!!`);
  }

  /**
   * 战斗失败
   * @param role 游戏角色
   */
  static lose(role: GameRole): Message {
    return this.text(`战斗失败, ${role.name}活力恢复中...`);
  }

  /**
   * 文本消息
   * @param extra 消息描述
   */
  static text(extra: string): Message {
    return {type: MessageType.TEXT, data: {extra: extra}};
  }

  /**
   * 结算消息
   * @param extra 消息描述
   */
  static liquidation(extra: string): Message {
    return {type: MessageType.LIQUIDATION, data: {extra: extra}};
  }
}

