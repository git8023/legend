import { Component, OnInit } from '@angular/core';
import {Player, players} from '../../game/role/Player';

@Component({
  selector: 'app-equipment',
  templateUrl: './equipment.component.html',
  styleUrls: ['./equipment.component.scss']
})
export class EquipmentComponent implements OnInit {

  // 当前玩家
  player:Player = players.getCurrent();

  constructor() { }

  ngOnInit() {
  }

}
