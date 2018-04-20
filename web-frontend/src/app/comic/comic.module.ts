import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { ComicRoutingModule } from './comic-routing.module';
import { ComicListComponent } from './comic-list/comic-list.component';

@NgModule({
  imports: [
    CommonModule,
    ComicRoutingModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: [ComicListComponent]
})
export class ComicModule { }
