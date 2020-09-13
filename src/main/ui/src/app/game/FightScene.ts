import {MessageQueue, rand} from "../common/utils";
import {Message, Messages, MessageType} from "./Message";

// 游戏角色
export class GameRole {
  // 名称
  name: string;
  // 图片资源
  pic: string;
  // 等级
  level: number;
  // 最大生命值
  maxHP: number;
  // 最大魔法值
  maxMP: number;
  // 速度
  speed: number;
  // 是否玩家
  isPlayer: boolean;

  // 当前生命值
  currentHP: number;
  // 当前魔法值
  currentMP: number;
  // 最小攻击值
  attackMin: number;
  // 最大攻击值
  attackMax: number;
  // 最小防御
  defenseMin: number;
  // 最大防御
  defenseMax: number;
}

// 战斗场景管理
export class FightScene {

  // 玩家
  player: GameRole;

  // 敌人
  enemy: GameRole;

  // 场景消息队列
  messageQueue: MessageQueue<Message> = new MessageQueue<Message>(20);

  // 准备开始战斗
  // 根据速度计算哪个游戏角色先开始执行动作
  readyFight() {
    this.messageQueue.pull({type: MessageType.TEXT, data: {extra: "战斗开始!!!"}});
  }

  // 创建战斗场景
  static create() {
    return new FightScene();
  }

  // 玩家使用普通攻击
  normalAttack() {

    // 计算出手速度
    if (this.player.speed > this.enemy.speed) {
      // 玩家普通攻击
      this.doNormalAttack(this.player, this.enemy)
      // 敌人攻击
      setTimeout(() => this.doNormalAttack(this.enemy, this.player), 500);
    }

  }

  // 玩家执行普通攻击
  private doNormalAttack(fromRole: GameRole, toRole: GameRole) {
    // 攻击者已经死亡
    if (0 == fromRole.currentHP) {
      this.messageQueue.pull(Messages.dead(fromRole));
      return;
    }

    // 被攻击者已经死亡
    if (0 == toRole.currentHP) {
      return;
    }

    let playerAttack = rand(fromRole.attackMin, fromRole.attackMax);
    let masterDefense = rand(toRole.defenseMin, toRole.defenseMax);
    let harm = Math.max(playerAttack - masterDefense, 1);
    toRole.currentHP = Math.max(toRole.currentHP - harm, 0);
    this.messageQueue.pull({
      type: MessageType.FIGHT,
      data: {
        fromRole: fromRole,
        toRole: toRole,
        harm: harm,
        extra: (0 == harm ? `被${toRole.name}灵巧躲过.` : "")
      }
    });
  }

  // 删除消息
  deleteMessage(msg: Message) {
    this.messageQueue.del(msg);
  }
}
