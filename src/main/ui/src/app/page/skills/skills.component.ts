import {Component, OnInit} from '@angular/core';
import {Skill, SkillStore} from '../../game/skill/Skill';
import {players} from '../../game/role/Player';

@Component({
  selector: 'app-skills',
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.scss']
})
export class SkillsComponent implements OnInit {

  store: Array<Skill>;

  constructor() {
    this.store = players.getCurrent().getSkills();
  }

  ngOnInit() {
  }

}
