import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {GameMap, GameMaps} from '../../game/GameMap';
import {GameRole} from '../../game/role/GameRole';
import {FightScene} from '../../game/FightScene';
import {Player} from '../../game/role/Player';
import {isString} from 'util';
import {guid, removeA} from "../../common/utils";
import {Skill} from '../../game/skill/Skill';
import {MasterRole} from '../../game/role/MasterRole';

@Component({
  selector: 'app-fight',
  templateUrl: './fight.component.html',
  styleUrls: ['./fight.component.scss']
})
export class FightComponent implements OnInit {
  static fightSceneInstance: FightScene = null;

  gameMap: GameMap;
  player: Player;
  enemies: MasterRole[] = [];

  // 战斗场景
  fightScene: FightScene;
  // 攻击中(一回合战斗未结束)
  isPause = false;
  // 伤害信息
  playerHarmInfo: Array<{ harm: number }> = [];
  enemyHarmInfo: Array<{ harm: number, role: MasterRole }> = [];
  // 延迟删除(key)
  durationDeleteKeys = {
    playerHarm: guid()
  };

  // 战斗消息执行删除动画后
  onMessageDelete = (data) => {
    this.fightScene.deleteMessage(data);
  };

  // 自动攻击(挂机)
  isAuto: boolean = false;

  // 下回合强制自动攻击
  private nextRoundAuto: boolean = false;

  // 正在受伤的角色
  hurtingRole: GameRole;

  constructor(private route: ActivatedRoute) {
  }

  ngOnInit() {
    let mapKey = this.route.snapshot.params.mapKey;
    this.gameMap = GameMaps[mapKey] || GameMap.getLocal() || GameMaps.XING_ZI_LIN;
    GameMap.setLocal(this.gameMap);

    // 创建游戏场景
    let isFirst = (null == FightComponent.fightSceneInstance);
    if (isFirst) {
      FightComponent.fightSceneInstance = this.fightScene = new FightScene(GameMap.getLocal());
    } else {
      this.fightScene = FightComponent.fightSceneInstance;
    }

    this.fightScene.fightEvent({
      // onStart: () => this.isPause = false,
      // onRoundStart: () => this.isPause = false,
      onRoundOver: () => {
        setTimeout(() => {
          this.hurtingRole = null;
        }, 500);
      },
      // onRejuvenation: () => this.isPause = (this.player.maxHP != this.player.currentHP),
      onLiquidation: (isDone) => {
        // if (isDone && this.nextRoundAuto) {
        //   this.nextRoundAuto = false;
        //   this.autoHandle();
        // }
      },
      onFindEnemy: (enemies: GameRole[]) => this.enemies = enemies,
      onManual: isManual => {
        this.isPause = (!isManual || this.isAuto);
        if (isManual && (this.nextRoundAuto || this.isAuto))
          this.autoHandle();
      },
      onHurt: (role, harm) => {
        if (role.isPlayer) this.playerHarmInfo.push({harm});
        else this.enemyHarmInfo.push({harm, role});
        this.hurtingRole = role;
      }
    });
    this.player = this.fightScene.player;

    if (isFirst) {
      this.fightScene.countdownNextEnemies();
    } else {
      this.fightScene.sync();
    }

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

  // 获取buff技能列表
  getBufSkills(): Array<Skill> {
    let sks: Array<Skill> = [];
    for (const sk of this.fightScene.buffSkills.keys())
      sks.push(sk);
    return sks;
  }

  // 自动攻击(挂机)
  swapAutoAttack() {
    this.isAuto = !this.isAuto;
    this.nextRoundAuto = this.isAuto;

    if (!this.isPause) {
      this.normalAttack();
    }
  }

  // 挂机
  private autoHandle() {
    this.normalAttack();
  }
}
