import {Component, OnInit} from '@angular/core';
import {Bag} from "../../game/Bag";
import {PlayerEquipments, players} from "../../game/role/Player";
import {GameProp} from "../../game/gameProp/GameProp";
import {Equipment} from "../../game/gameProp/Equipment";
import {eachA, eachO, valuesO} from "../../common/utils";

@Component({
  selector: 'app-package',
  templateUrl: './package.component.html',
  styleUrls: ['./package.component.scss']
})
export class PackageComponent implements OnInit {

  bag: Bag = players.getCurrent().bag;
  currentProp: Equipment;
  replaceUpdateInfo: Array<{ name: string, value: number }> = [];
  clearReplaceUpdateInfo = () => {
    this.replaceUpdateInfo.length = 0;
  };

  constructor() {
  }

  ngOnInit() {
    eachA(this.bag.props, prop => {
      if (prop)
        this.currentProp = <Equipment>prop;
    });
  }

  // 显示道具详情
  showDetail($event: MouseEvent, prop: GameProp) {
    this.currentProp = <Equipment>prop;
  }

  // 使用游戏道具
  useGameProp(prop: GameProp, index: number) {
    if (prop instanceof Equipment)
      this.replaceEquipment(prop, index);
  }

  // 换装
  replaceEquipment(prop: Equipment, index: number) {
    let player = players.getCurrent();

    // 记录换装前数据
    let before = {};
    eachA(valuesO(PlayerEquipments.propsMap), e => before[e] = 0);
    eachO<number>(before, (v, k) => before[k] = player[k]);

    // 执行换装
    let oldProp = player.equipments.replace(prop);
    this.bag.replace(index, oldProp);

    // 换装后数据
    let after = {};
    eachO<number>(before, (v, k) => after[k] = player[k]);
    // 差异
    this.replaceUpdateInfo.length = 0;
    eachO<number>(after, (v, k) => {
      this.replaceUpdateInfo.push({
        name: PlayerEquipments.propsCnNames[k],
        value: v - (before[k] || 0)
      });
    });
    console.log(before, after, this.replaceUpdateInfo);
  }
}
