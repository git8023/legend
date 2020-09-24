// 技能
import {eachO, randA} from '../../common/utils';
import {Player} from '../role/Player';
import {FightScene} from '../FightScene';
import {Messages} from '../Message';

export interface Skill {

  // 技能名称
  name: string;

  // 学习等级
  lv: number;

  // 魔法消耗
  mp: number;

  // 冷却
  cd: number;

  // 技能图片
  pic: string;

  // 描述
  noteHtml: string;

  // 已学习次数
  upTimes: number;

  // 最大升级次数
  maxUpTimes: number;

  // 快捷方式
  shortcut?: string;

  // 额外数据
  extra?: { [s: string]: any };

  // 升级
  upgrade?(): void;

  // 使用技能
  use(fs: FightScene): void;
}

// 技能库
export class SkillStore {

  // 定义所有技能
  store: { [lv: number]: Array<Skill> } = [];
  skills: Array<Skill> = [];
  // 可用升级点数
  points: number;
  // 快捷方式
  shortcut: { [n: string]: Skill } = {};

  // 初始化
  constructor(private player: Player) {
    this.points = 0;
    this.add({
      name: '二连刺',
      lv: 2,
      mp: 2,
      cd: 2,
      upTimes: 0,
      maxUpTimes: 10,
      pic: '/assets/img/fight/skill/er_lian_ci.png',
      extra: {attackAddtion: 5},
      get noteHtml() {
        return `快速刺出两剑攻向敌人要害, 造成两段伤害.
                <div>
                  <span class="color-green">首段攻击</span>:
                  <span class="color-red">[必中]</span>最大攻击<span class="color-red">${this.extra.attackAddtion}%</span>+最小攻击.
                </div>
                <div>
                  <span class="color-green">二段攻击</span>:
                  首段攻击<span class="color-red">50%</span>对敌人造成二次伤害.
                </div>`
      },
      upgrade() {
        this.upTimes++;
        let map = {
          0: {attackAddtion: 5, mp: 2},
          1: {attackAddtion: 6, mp: 2},
          2: {attackAddtion: 7, mp: 3},
          3: {attackAddtion: 8, mp: 3},
          4: {attackAddtion: 9, mp: 4},
          5: {attackAddtion: 10, mp: 5},
          6: {attackAddtion: 11, mp: 8},
          7: {attackAddtion: 12, mp: 12},
          8: {attackAddtion: 13, mp: 15},
          9: {attackAddtion: 14, mp: 20},
        };
        let cfg = map[this.upTimes];
        this.extra.attackAddtion = cfg.attackAddtion;
        this.mp = cfg.mp;
      },
      use(fs) {
        if (this.mp > player.currentMP) {
          fs.onMessage(Messages.text(`${player.name} 魔法值不足, 技能 [${this.name}] 发动失败!`))
          return;
        }

        // 随机选中单个敌人
        let master = randA(fs.getEnemies());

        // 首段攻击
        let attack = Math.ceil((this.extra.attackAddtion / 100) * player.attackMax + player.attackMax);
        let defense = fs.getDefense(master);
        let harm = attack - defense;
        fs.onHurt(player, master, Math.max(0, harm));

        // 二段攻击
        attack = Math.ceil(attack / 2);
        fs.onHurt(player, master, Math.max(0, attack - defense));

        player.currentMP -= this.mp;
      }
    });
    this.add({
      name: '霜冻护甲',
      lv: 5,
      mp: 9,
      cd: 5,
      upTimes: 0,
      maxUpTimes: 10,
      pic: '/assets/img/fight/skill/bing_shuang_hu_jia.bmp',
      extra: {defenseMax: 3, keep: 1},
      get noteHtml() {
        return `伟大的<span class="color-green">肯尼迪大魔法师</span>赐予霜冻结界覆盖全身铠甲, 极大提高铠甲防御.
                  <div>
                    <div>Buff <span class="color-red">${this.extra.keep}回合</span></div>
                    <div>护甲 <span class="color-red"> +${this.extra.defenseMax}</span></div>
                  </div>`
      },
      upgrade() {
        if (1 < this.upTimes)
          this.extra.defenseMax = Math.ceil((this.extra.defenseMax || 3) * 1.2);
        this.upTimes++;
      },
      use(fs) {
        fs.addBuff(this, this.extra.keep);
        fs.onMessage(Messages.text(`${player.name} 使用技能 [${this.name}]:
                                    护甲+${this.extra.defenseMax}, 持续${this.extra.keep}回合`));
      }
    });
    this.add({
      name: '闪电链',
      lv: 7,
      mp: 12,
      cd: 3,
      upTimes: 0,
      maxUpTimes: 10,
      pic: '/assets/img/fight/skill/shan_dian_lian.bmp',
      extra: {damping: 20},
      get noteHtml() {
        return `发射出一道猛烈的闪电，并在附近的敌人身上不停的跳跃．
                每次跳跃衰减<span class="color-red">${this.extra.damping}%</span>的攻击力.
                <div>跳跃次数: <span class="color-red">3</span></div>`;
      },
      upgrade() {
        if (0 == this.upTimes) {
          this.extra.damping = 20;
        } else {
          this.extra.damping--;
        }
        this.upTimes++;
      },
      use(fs) {

      }
    });
    // 按学习技能排序
    this.skills = this.skills.sort((a, b) => a.lv - b.lv);
  }

  // 添加技能库
  private add(skill: Skill): SkillStore {
    this.skills.push(skill);
    let old = this.store[skill.lv];
    if (!old) this.store[skill.lv] = old = [];
    old.push(skill);
    return this;
  }

  // 技能升级
  upgrade(skill: Skill) {
    if ((this.points > 0) && (skill.upTimes < skill.maxUpTimes)) {
      skill.upgrade();
      this.points--;
    }
  }

  // 设置快捷方式
  setShortcut(key: string, skill: Skill) {
    eachO<Skill>(this.shortcut, (v, k) => {
      if (v == skill || k == key) {
        v.shortcut = null;
        delete this.shortcut[k];
      }
    });
    this.shortcut[key] = skill;
    skill.shortcut = key;
  }

  // 获取技能图片地址
  // e.g: url('/xx/xx.png')
  getSkillPic(key: string): string {
    let pic = (this.shortcut[key] || {pic: '/assets/img/fight/skill/unknow.png'}).pic;
    return `url(${pic})`;
  }

  // 校验是否配置指定快捷键
  validShortcut(key: string): boolean {
    return !!this.shortcut[key];
  }

}

// SkillStore.init();
// export {SkillStore}
