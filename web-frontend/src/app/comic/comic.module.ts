import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {ComicRoutingModule} from './comic-routing.module';
import {ComicListComponent} from './comic-list/comic-list.component';
import {ImportComicListComponent} from './import-comic-list/import-comic-list.component';
import {ComicListEntryComponent} from './comic-list-entry/comic-list-entry.component';
import {ComicDetailsComponent} from './comic-details/comic-details.component';
import {DuplicatePageListComponent} from './duplicate-page-list/duplicate-page-list.component';
import {DuplicatePageListEntryComponent} from './duplicate-page-list-entry/duplicate-page-list-entry.component';
import {PageThumbnailComponent} from './page-thumbnail/page-thumbnail.component';

@NgModule({
  imports: [
    CommonModule,
    ComicRoutingModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: [
    ComicListComponent,
    ImportComicListComponent,
    ComicListEntryComponent,
    ComicDetailsComponent,
    DuplicatePageListComponent,
    DuplicatePageListEntryComponent,
    PageThumbnailComponent,
  ]
})
export class ComicModule {}
