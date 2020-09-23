import {Component, OnInit} from '@angular/core';
import {Skill, SkillStore} from '../../game/skill/Skill';
import {players} from '../../game/role/Player';

@Component({
  selector: 'app-skills',
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.scss']
})
export class SkillsComponent implements OnInit {

  // 玩家技能库
  skillStore: SkillStore;

  // true-显示快捷方式配置
  // false-隐藏
  isShowCfgBlock: boolean = false;

  // 正在配置的技能
  cfgSkill: Skill;

  constructor() {
    this.skillStore = players.getCurrent().skillStore;
  }

  ngOnInit() {
  }

  // 技能升级
  upSkill(skill: Skill) {
    this.skillStore.upgrade(skill);
  }

  // 显示快捷方式配置
  showCfg(skill: Skill) {
    this.isShowCfgBlock = !this.isShowCfgBlock;
    this.cfgSkill = this.isShowCfgBlock ? skill : null;
  }

  // 设置快捷方式
  setShortcut(key: string) {
    this.skillStore.setShortcut(key, this.cfgSkill);
    this.cfgSkill = null;
    this.isShowCfgBlock = false;
  }

  // 获取指定快捷方式配置的技能图标
  getSkillPic(key: string): string {
    return this.skillStore.getSkillPic(key);
  }
}
