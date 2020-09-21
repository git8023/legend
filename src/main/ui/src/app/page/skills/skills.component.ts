import {Component, OnInit} from '@angular/core';
import {Skill, SkillStore} from '../../game/skill/Skill';

@Component({
  selector: 'app-skills',
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.scss']
})
export class SkillsComponent implements OnInit {

  store: Array<Skill> = SkillStore.skills;

  constructor() {
  }

  ngOnInit() {
  }

}
