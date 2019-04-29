import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './navbar.component';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../material/material.module';
import { DirectivesModule } from '../helpers/directives.module';

@NgModule({
  declarations: [NavbarComponent],
  imports: [
    CommonModule,
    TranslateModule,
    MaterialModule,
    DirectivesModule,
  ],
  exports: [NavbarComponent]
})
export class NavbarModule { }