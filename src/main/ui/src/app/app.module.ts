import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './page/dashboard/dashboard.component';
import { PlayerComponent } from './page/player/player.component';
import { EquipmentComponent } from './page/equipment/equipment.component';
import { PackageComponent } from './page/package/package.component';
import { SkillsComponent } from './page/skills/skills.component';
import { MapComponent } from './page/map/map.component';
import { DungeonComponent } from './page/dungeon/dungeon.component';
import { FightComponent } from './page/fight/fight.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    PlayerComponent,
    EquipmentComponent,
    PackageComponent,
    SkillsComponent,
    MapComponent,
    DungeonComponent,
    FightComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
