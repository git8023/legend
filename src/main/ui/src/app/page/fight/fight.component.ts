import {Component, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {GameMap, GameMaps} from '../../game/GameMap';
import {GameRole} from '../../game/role/GameRole';
import {FightScene} from '../../game/FightScene';
import {Player} from '../../game/role/Player';
import {isString} from 'util';
import {guid, removeA} from "../../common/utils";

@Component({
  selector: 'app-fight',
  templateUrl: './fight.component.html',
  styleUrls: ['./fight.component.scss']
})
export class FightComponent implements OnInit {
  gameMap: GameMap;
  player: Player;
  enemy: GameRole;

  // 战斗场景
  fightScene: FightScene;
  // 攻击中(一回合战斗未结束)
  isPause = false;
  // 伤害信息
  playerHarmInfo: Array<{ harm: number }> = [];
  enemyHarmInfo: Array<{ harm: number }> = [];
  // 延迟删除(key)
  durationDeleteKeys = {
    playerHarm: guid()
  };

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
    this.fightScene = new FightScene(this.gameMap);
    this.fightScene.fightEvent({
      // onStart: () => this.isPause = false,
      // onRoundStart: () => this.isPause = false,
      // onRoundOver: () => this.isPause = false,
      // onRejuvenation: () => this.isPause = (this.player.maxHP != this.player.currentHP),
      // onLiquidation: (isDone) => this.isPause = !isDone,
      onFindEnemy: (enemies: GameRole[]) => this.enemy = enemies[0],
      onManual: isManual => this.isPause = !isManual,
      onHurt: ({isPlayer}, harm) => {
        if (isPlayer)
          this.playerHarmInfo.push({harm});
        else
          this.enemyHarmInfo.push({harm});
      }
    });
    this.player = this.fightScene.player;
    this.fightScene.countdownNextEnemies();
  }

  // 普通攻击(敌人/队友)
  normalAttack() {
    this.fightScene.normalAttack();
  }

  // 普通防御
  normalDefense() {
    this.fightScene.normalDefense();
  }

  // 显示额外文本内容
  showExtra(extra: any) {
    if (isString(extra))
      return extra;
  }

  // 玩家逃跑
  doEscape() {
    this.fightScene.playerEscape();
  }

  // 删除伤害信息
  deleteDeduct = (info: any) => {
    removeA(this.playerHarmInfo, info);
    removeA(this.enemyHarmInfo, info);
  }

  // 玩家使用技能
  useSkill(key: string) {
    if (this.player.skillStore.validShortcut(key))
      this.fightScene.playerUseSkill(key);
  }
}
