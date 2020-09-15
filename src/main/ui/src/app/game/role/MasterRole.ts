import {GameRole} from './GameRole';

// 游戏敌人
export class MasterRole extends GameRole {

  static of(role: GameRole): MasterRole {
    return new MasterRole(
      role.name,
      role.pic,
      role.level,
      role.maxHP,
      role.maxMP,
      role.speed,
      role.attackMin,
      role.attackMax,
      role.defenseMin,
      role.defenseMax
    );
  }

}
