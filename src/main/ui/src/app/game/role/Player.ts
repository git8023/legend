import {GameRole} from './GameRole';

// 等级经验
class LevelExp {
}

// 玩家
export class Player extends GameRole {

  lv: LevelExp = new LevelExp();

  static of(role: GameRole) {
    let player = new Player(
      role.name, role.pic,
      role.level, role.maxHP, role.maxMP, role.speed, role.attackMin,
      role.attackMax, role.defenseMin, role.defenseMax
    );
    player.isPlayer = true;
    return player;
  }

  // TODO 计算玩家经验
  appendExp(exp: number) {
  }
}
