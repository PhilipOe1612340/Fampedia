import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainComponent } from './main.component';
import { Routes, RouterModule } from '@angular/router';
import { ToolHeaderComponent } from './tool-header/tool-header.component';
import { TranslateModule } from '@ngx-translate/core';
import { DirectivesModule } from '../helpers/directives.module';
import { MaterialModule } from '../material/material.module';
import { TimelineElementComponent } from './timeline-element/timeline-element.component';
import { MainService } from './main.service';
import { NavbarModule } from '../navbar/navbar.module';
import { TimelineComponent } from './timeline/timeline.component';
import { NewsComponent } from './news/news.component';
import { ArchiveComponent } from './archive/archive.component';

const routes: Routes = [{ path: '**', component: MainComponent }];

@NgModule({
  declarations: [MainComponent, ToolHeaderComponent, TimelineElementComponent, TimelineComponent, NewsComponent, ArchiveComponent],
  imports: [
    TranslateModule,
    CommonModule,
    RouterModule.forChild(routes),
    DirectivesModule,
    NavbarModule,
    MaterialModule
  ],
  providers: [MainService]

})
export class MainModule { }
