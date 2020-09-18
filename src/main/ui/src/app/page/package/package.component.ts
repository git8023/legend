import { Component, OnInit } from '@angular/core';
import {Bag} from "../../game/Bag";
import {players} from "../../game/role/Player";

@Component({
  selector: 'app-package',
  templateUrl: './package.component.html',
  styleUrls: ['./package.component.scss']
})
export class PackageComponent implements OnInit {

  bag:Bag = players.getCurrent().bag;

  constructor() { }

  ngOnInit() {
  }

}
