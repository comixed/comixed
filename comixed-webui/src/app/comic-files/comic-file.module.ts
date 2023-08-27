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
import { ImportComicsPageComponent } from './pages/import-comics-page/import-comics-page.component';
import { ComicFileCoverUrlPipe } from './pipes/comic-file-cover-url.pipe';
import { ComicFileRouting } from './comic-file.routing';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { TranslateModule } from '@ngx-translate/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { ComicFileListEffects } from '@app/comic-files/effects/comic-file-list.effects';
import { ImportComicFilesEffects } from '@app/comic-files/effects/import-comic-files.effects';
import {
  IMPORT_COMIC_FILES_FEATURE_KEY,
  reducer as importComicFilesReducer
} from '@app/comic-files/reducers/import-comic-files.reducer';
import {
  COMIC_FILE_LIST_FEATURE_KEY,
  reducer as comicFileListReducer
} from '@app/comic-files/reducers/comic-file-list.reducer';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { LibraryModule } from '@app/library/library.module';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ComicBooksModule } from '@app/comic-books/comic-books.module';
import {
  reducer as scrapeMetadataReducer,
  SCRAPE_METADATA_FEATURE_KEY
} from '@app/comic-files/reducers/scrape-metadata.reducer';
import { ScrapeMetadataEffects } from '@app/comic-files/effects/scrape-metadata.effects';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { FlexLayoutModule } from '@angular-ru/cdk/flex-layout';
import { ComicFileLoaderComponent } from './components/comic-file-loader/comic-file-loader.component';
import { ImportStatusPageComponent } from './pages/import-status-page/import-status-page.component';

@NgModule({
  declarations: [
    ImportComicsPageComponent,
    ComicFileCoverUrlPipe,
    ComicFileLoaderComponent,
    ImportStatusPageComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ComicFileRouting,
    TranslateModule.forRoot(),
    StoreModule.forFeature(COMIC_FILE_LIST_FEATURE_KEY, comicFileListReducer),
    StoreModule.forFeature(
      IMPORT_COMIC_FILES_FEATURE_KEY,
      importComicFilesReducer
    ),
    StoreModule.forFeature(SCRAPE_METADATA_FEATURE_KEY, scrapeMetadataReducer),
    EffectsModule.forFeature([
      ComicFileListEffects,
      ImportComicFilesEffects,
      ScrapeMetadataEffects
    ]),
    MatToolbarModule,
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatInputModule,
    MatTooltipModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSortModule,
    MatCardModule,
    LibraryModule,
    MatProgressBarModule,
    ComicBooksModule,
    FlexLayoutModule,
    MatMenuModule,
    MatPaginatorModule
  ],
  exports: [CommonModule]
})
export class ComicFileModule {}
