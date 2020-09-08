import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {GameMap, GameMaps} from '../../game/GameMap';

@Component({
  selector: 'app-fight',
  templateUrl: './fight.component.html',
  styleUrls: ['./fight.component.scss']
})
export class FightComponent implements OnInit {

  gameMap: GameMap;

  constructor(private route: ActivatedRoute) {
  }

  ngOnInit() {
    let mapKey = this.route.snapshot.params.mapKey;
    this.gameMap = GameMaps[mapKey] || GameMaps.XING_ZI_LIN;
  }

}
