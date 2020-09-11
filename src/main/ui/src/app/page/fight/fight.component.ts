import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {GameMap, GameMaps} from '../../game/GameMap';
import {rand} from '../../common/utils';

@Component({
  selector: 'app-fight',
  templateUrl: './fight.component.html',
  styleUrls: ['./fight.component.scss']
})
export class FightComponent implements OnInit {

  @ViewChild('fightInfoRef', {static: true}) fightInfoRef: ElementRef;

  gameMap: GameMap;
  player = {
    name: '七月',
    pic: '/assets/fight/headPic/player-1.png',
    level: 30,
    maxHp: 450,
    maxMp: 200,

    hp: 300,
    mp: 160,
    attackMin: 1,
    attackMax: 10,
    defenseMin: 2,
    defenseMax: 7,
  };
  master = {
    name: '毒蜘蛛',
    pic: '/assets/fight/master/du_zhi_zhu.png',
    level: 12,
    maxHp: 200,
    maxMp: 60,

    hp: 180,
    mp: 10,
    attackMin: 1,
    attackMax: 5,
    defenseMin: 0,
    defenseMax: 3,
  };

  attackMessages: string[] = [];

  constructor(private route: ActivatedRoute) {
  }

  ngOnInit() {
    let mapKey = this.route.snapshot.params.mapKey;
    this.gameMap = GameMaps[mapKey] || GameMaps.XING_ZI_LIN;
  }

  // 攻击敌人
  attackEnemy() {
    // 玩家攻击
    let playerAttack = rand(this.player.attackMin, this.player.attackMax);
    let masterDefense = rand(this.master.defenseMin, this.master.defenseMax);
    let harm = Math.max(playerAttack - masterDefense, 1);
    this.master.hp = Math.max(this.master.hp - harm, 0);

    this.attackMessages.push(`${this.player.name}(普通攻击) 对 ${this.player.name} 造成 ${harm} 点伤害`);
  }

}
