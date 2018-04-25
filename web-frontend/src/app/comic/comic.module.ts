import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {ComicRoutingModule} from './comic-routing.module';
import {ComicListComponent} from './comic-list/comic-list.component';
import {ImportComicsComponent} from './import-comics/import-comics.component';
import {ComicListEntryComponent} from './comic-list-entry/comic-list-entry.component';

@NgModule({
  imports: [
    CommonModule,
    ComicRoutingModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: [ComicListComponent, ImportComicsComponent, ComicListEntryComponent]
})
export class ComicModule {}
