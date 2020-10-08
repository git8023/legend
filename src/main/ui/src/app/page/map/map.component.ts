import {Component, OnInit} from '@angular/core';
import {GameMap, GameMaps} from '../../game/GameMap';
import {extendPropsA, valuesO} from '../../common/utils';
import {Router} from '@angular/router';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  mapLocalPointer = {left: '0px', top: '0px'};
  mapLocal: GameMap = GameMap.getLocal();

  constructor(
    private router: Router
  ) {
  }

  ngOnInit() {
  }

  /**
   * 移动到指定地图
   * @param $event
   * @param key
   */
  moveTo($event: MouseEvent, key: string) {
    if (this.mapLocal == GameMaps[key])
      this.router.navigate(['/fight', {mapKey: key}]).finally();

    GameMap.setLocal(this.mapLocal = GameMaps[key]);
    this.mapLocalPointer.left = this.mapLocal.pointCenter.x + 'px';
    this.mapLocalPointer.top = this.mapLocal.pointCenter.y + 'px';
  }

  /**
   * 获取所有地图数据
   */
  maps(): GameMap[] {
    return valuesO<GameMap>(GameMaps);
  }
}
