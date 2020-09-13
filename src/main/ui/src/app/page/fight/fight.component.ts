import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {GameMap, GameMaps} from '../../game/GameMap';
import {rand} from '../../common/utils';
import {FightScene, GameRole} from "../../game/FightScene";
import {DelayConfigure} from "../../directive/duration-delete.directive";

@Component({
  selector: 'app-fight',
  templateUrl: './fight.component.html',
  styleUrls: ['./fight.component.scss']
})
export class FightComponent implements OnInit {

  @ViewChild('fightInfoRef', {static: true}) fightInfoRef: ElementRef;

  gameMap: GameMap;
  player: GameRole = {
    name: '七月',
    pic: '/assets/fight/headPic/player-1.png',
    level: 30,
    maxHP: 450,
    maxMP: 200,
    speed: 5,
    isPlayer: true,

    currentHP: 300,
    currentMP: 160,
    attackMin: 1,
    attackMax: 10,
    defenseMin: 2,
    defenseMax: 7,
  };
  enemy: GameRole = {
    name: '毒蜘蛛',
    pic: '/assets/fight/master/du_zhi_zhu.png',
    level: 12,
    maxHP: 200,
    maxMP: 60,
    speed: 3,
    isPlayer: false,

    currentHP: 180,
    currentMP: 10,
    attackMin: 1,
    attackMax: 5,
    defenseMin: 0,
    defenseMax: 3,
  };

  // 战斗场景
  fightScene: FightScene;

  // 战斗消息执行删除动画后
  onMessageDelete = (data) => {
    console.log("消息被删除", data);
    this.fightScene.deleteMessage(data);
  };

  constructor(private route: ActivatedRoute) {
  }

  ngOnInit() {
    let mapKey = this.route.snapshot.params.mapKey;
    this.gameMap = GameMaps[mapKey] || GameMaps.XING_ZI_LIN;

    // 创建游戏场景
    this.fightScene = FightScene.create();
    this.fightScene.player = this.player;
    this.fightScene.enemy = this.enemy;
    this.fightScene.readyFight();
  }

  // 准备攻击(敌人/队友)
  normalAttack() {
    this.fightScene.normalAttack();
  }

}
