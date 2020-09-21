// 技能
export class Skill {

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

}

// 技能库
class SkillStore {

  // 定义所有技能
  static store: { [lv: number]: Array<Skill> } = [];
  public static skills: Array<Skill> = [];

  // 初始化
  static init() {
    this.add({
      name: '二连刺',
      lv: 2,
      mp: 2,
      cd: 2,
      pic: '/assets/img/fight/skill/er_lian_ci.png',
      noteHtml: `快速刺出两剑攻向敌人要害，造成两段伤害。
                <div>
                  <span class="color-green">首段攻击</span>:
                  <span class="color-red">[必中]</span>最大攻击<span class="color-red">5%</span>+最小攻击
                </div>
                <div>
                  <span class="color-green">二段攻击</span>:
                  首段攻击<span class="color-red">50%</span>对敌人造成二次伤害
                </div>`
    });
    this.add({
      name: '霜冻护甲',
      lv: 5,
      mp: 9,
      cd: 5,
      pic: '/assets/img/fight/skill/bing_shuang_hu_jia.bmp',
      noteHtml: `伟大的<span class="color-green">肯尼迪大魔法师</span>赐予霜冻结界覆盖全身铠甲, 极大提高铠甲防御.
                  <div>
                    <div>Buff <span class="color-red">1回合</span></div>
                    <div>护甲 <span class="color-red"> +3</span></div>
                  </div>`
    });
    this.add({
      name: '闪电链',
      lv: 7,
      mp: 12,
      cd: 3,
      pic: '/assets/img/fight/skill/shan_dian_lian.bmp',
      noteHtml: `发射出一道猛烈的闪电，并在附近的敌人身上不停的跳跃．每次跳跃损失 <span class="color-red">10%</span> 的攻击力.
                <div>
                  <div>跳跃次数: <span class="color-red">3</span></div>
                </div>`
    });

    // 按学习技能排序
    this.skills = this.skills.sort((a, b) => a.lv - b.lv);
  }

  // 添加技能库
  private static add(skill: Skill): SkillStore {
    this.skills.push(skill);
    let old = this.store[skill.lv];
    if (!old) this.store[skill.lv] = old = [];
    old.push(skill);
    return this;
  }
}

SkillStore.init();
export {SkillStore}
