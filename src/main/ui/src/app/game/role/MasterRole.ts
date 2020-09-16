import {GameRole} from './GameRole';

// 游戏敌人
export class MasterRole extends GameRole {
  isBoss?: boolean;

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

  static ofBoss(role: GameRole) {
    let master = this.of(role);
    master.isBoss = true;
    return master;
  }
}
