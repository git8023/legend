import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {DashboardComponent} from "./page/dashboard/dashboard.component";
import {PlayerComponent} from "./page/player/player.component";
import {EquipmentComponent} from "./page/equipment/equipment.component";
import {PackageComponent} from "./page/package/package.component";
import {SkillsComponent} from "./page/skills/skills.component";
import {MapComponent} from "./page/map/map.component";
import {DungeonComponent} from "./page/dungeon/dungeon.component";


const routes: Routes = [
  {
    path: '', component: DashboardComponent, children: [
      {path: 'player', component: PlayerComponent},
      {path: 'equipment', component: EquipmentComponent},
      {path: 'package', component: PackageComponent},
      {path: 'skills', component: SkillsComponent},
      {path: 'map', component: MapComponent},
      {path: 'dungeon', component: DungeonComponent},
    ]
  },
  {path: '', redirectTo: '', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
