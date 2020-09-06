import {Component, OnInit} from '@angular/core';
import {GameNav} from "../../game/GameNav";

class GameNavOption {
  id: string;
  text: string;
  link: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  gameNavs: GameNavOption[] = [
    {id: 'PLAYER', text: '人物', link: '/player'},
    {id: 'PACKAGE', text: '背包', link: '/package'},
    {id: 'EQUIPMENT', text: '装备', link: '/equipment'},
    {id: 'SKILLS', text: '技能', link: '/skills'},
    {id: 'MAP', text: '地图&战斗', link: '/map'},
    {id: 'DUNGEON', text: '副本', link: '/dungeon'},
  ]
  gameNav: GameNavOption;

  constructor() {
  }

  ngOnInit() {
  }

  activeGameNav(nav: GameNavOption) {
    this.gameNav = nav;
  }
}
