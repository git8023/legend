import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {DashboardComponent} from './page/dashboard/dashboard.component';
import {EquipmentComponent} from './page/equipment/equipment.component';
import {PackageComponent} from './page/package/package.component';
import {SkillsComponent} from './page/skills/skills.component';
import {MapComponent} from './page/map/map.component';
import {FightComponent} from './page/fight/fight.component';
import {DurationDeleteDirective} from './directive/duration-delete.directive';
import {SkillWaitDirective} from './directive/skill-wait.directive';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    EquipmentComponent,
    PackageComponent,
    SkillsComponent,
    MapComponent,
    FightComponent,
    DurationDeleteDirective,
    SkillWaitDirective
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
