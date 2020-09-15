import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {GameMap, GameMaps} from '../../game/GameMap';
import {GameRole} from '../../game/role/GameRole';
import {FightScene} from '../../game/FightScene';
import {Player} from '../../game/role/Player';

@Component({
  selector: 'app-fight',
  templateUrl: './fight.component.html',
  styleUrls: ['./fight.component.scss']
})
export class FightComponent implements OnInit {
  @ViewChild('fightInfoRef', {static: true}) fightInfoRef: ElementRef;

  gameMap: GameMap;
  player: Player = Player.of({
    name: '七月',
    pic: '/assets/fight/headPic/player-1.png',
    level: 1,
    maxHP: 20,
    maxMP: 15,
    speed: 5,
    attackMin: 1,
    attackMax: 5,
    defenseMin: 1,
    defenseMax: 2,
  });
  enemy: GameRole;

  // 战斗场景
  fightScene: FightScene;
  // 攻击中(一回合战斗未结束)
  isPause = false;

  // 战斗消息执行删除动画后
  onMessageDelete = (data) => {
    this.fightScene.deleteMessage(data);
  };

  constructor(private route: ActivatedRoute) {
  }

  ngOnInit() {
    let mapKey = this.route.snapshot.params.mapKey;
    this.gameMap = GameMaps[mapKey] || GameMaps.XING_ZI_LIN;

    // 创建游戏场景
    this.fightScene = new FightScene(this.gameMap, this.player);
    this.fightScene.fightEvent({
      // onStart: () => this.isPause = false,
      // onRoundStart: () => this.isPause = false,
      // onRoundOver: () => this.isPause = false,
      // onRejuvenation: () => this.isPause = (this.player.maxHP != this.player.currentHP),
      // onLiquidation: (isDone) => this.isPause = !isDone,
      onFindEnemy: (enemies: GameRole[]) => this.enemy = enemies[0],
      onManual: isManual => this.isPause = !isManual
    });
    this.fightScene.countdownNextEnemies();
  }

  // 准备攻击(敌人/队友)
  normalAttack() {
    this.fightScene.normalAttack();
  }

}
