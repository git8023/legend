import {Component, OnInit} from '@angular/core';
import {EquipmentWorth, Player, PlayerEquipments, players} from '../../game/role/Player';

@Component({
  selector: 'app-equipment',
  templateUrl: './equipment.component.html',
  styleUrls: ['./equipment.component.scss']
})
export class EquipmentComponent implements OnInit {

  // 当前玩家
  player: Player = players.getCurrent();

  // 玩家穿戴装备
  equipments: PlayerEquipments;

  // 额外附加信息
  playerExtra = {
    expPercent: 0,
    equipmentsWorth: <EquipmentWorth>{},
  };

  constructor() {
    this.equipments = players.getCurrent().equipments;
  }

  ngOnInit() {
    this.playerExtra.expPercent = this.player.exp.expPercent();
    this.playerExtra.equipmentsWorth = this.player.equipments.getWorth();
  }

}
