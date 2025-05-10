/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListsRouting } from './lists.routing';
import { StoreModule } from '@ngrx/store';
import { readingListsFeature } from '@app/lists/reducers/reading-lists.reducer';
import { EffectsModule } from '@ngrx/effects';
import { ReadingListsEffects } from '@app/lists/effects/reading-lists.effects';
import { ReadingListsPageComponent } from './pages/reading-lists-page/reading-lists-page.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReadingListDetailPageComponent } from './pages/reading-list-detail-page/reading-list-detail-page.component';
import { MatCardModule } from '@angular/material/card';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { readingListDetailsFeature } from '@app/lists/reducers/reading-list-detail.reducer';
import { ReadingListDetailEffects } from '@app/lists/effects/reading-list-detail.effects';
import { readingListEntriesFeature } from '@app/lists/reducers/reading-list-entries.reducer';
import { ReadingListEntriesEffects } from '@app/lists/effects/reading-list-entries.effects';
import { LibraryModule } from '@app/library/library.module';
import { downloadReadingListFeature } from '@app/lists/reducers/download-reading-list.reducer';
import { DownloadReadingListEffects } from '@app/lists/effects/download-reading-list.effects';
import { uploadReadingListFeature } from '@app/lists/reducers/upload-reading-list.reducer';
import { UploadReadingListEffects } from '@app/lists/effects/upload-reading-list.effects';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ComicBooksModule } from '@app/comic-books/comic-books.module';

@NgModule({
  declarations: [ReadingListsPageComponent, ReadingListDetailPageComponent],
  imports: [
    CommonModule,
    ListsRouting,
    TranslateModule.forRoot(),
    StoreModule.forFeature(readingListsFeature),
    StoreModule.forFeature(readingListDetailsFeature),
    StoreModule.forFeature(readingListEntriesFeature),
    StoreModule.forFeature(downloadReadingListFeature),
    StoreModule.forFeature(uploadReadingListFeature),
    EffectsModule.forFeature([
      ReadingListsEffects,
      ReadingListDetailEffects,
      ReadingListEntriesEffects,
      DownloadReadingListEffects,
      UploadReadingListEffects
    ]),
    MatToolbarModule,
    MatPaginatorModule,
    MatTableModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatCardModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    LibraryModule,
    MatCheckboxModule,
    ComicBooksModule
  ],
  exports: [CommonModule]
})
export class ListsModule {}
