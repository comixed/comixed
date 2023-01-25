/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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
import { CoreModule } from '../core/core.module';
import { LibraryRouting } from '@app/library/library.routing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { MatTableModule } from '@angular/material/table';
import { FlexModule } from '@angular/flex-layout';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  LIBRARY_FEATURE_KEY,
  reducer as libraryReducer
} from '@app/library/reducers/library.reducer';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatExpansionModule } from '@angular/material/expansion';
import { LibraryPageComponent } from './pages/library-page/library-page.component';
import { MatSliderModule } from '@angular/material/slider';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTreeModule } from '@angular/material/tree';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSidenavModule } from '@angular/material/sidenav';
import { SelectedComicsComponent } from './components/selected-comics/selected-comics.component';
import { OverlayModule } from '@angular/cdk/overlay';
import { ComicDetailsDialogComponent } from './components/comic-details-dialog/comic-details-dialog.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ScrapingPageComponent } from '@app/library/pages/scraping-page/scraping-page.component';
import { ComicBooksModule } from '@app/comic-books/comic-books.module';
import { ArchiveTypePipe } from './pipes/archive-type.pipe';
import { UnreadComicsPipe } from './pipes/unread-comics.pipe';
import {
  DUPLICATE_PAGE_LIST_FEATURE_KEY,
  reducer as comicsWithDuplicatePagesReducer
} from '@app/library/reducers/duplicate-page-list.reducer';
import { DuplicatePageListEffects } from '@app/library/effects/duplicate-page-list.effects';
import { DuplicatePageListPageComponent } from './pages/duplicate-page-list-page/duplicate-page-list-page.component';
import { ComicsWithDuplicatePageComponent } from './components/comics-with-duplicate-page/comics-with-duplicate-page.component';
import { DuplicatePageDetailPageComponent } from './pages/duplicate-page-detail-page/duplicate-page-detail-page.component';
import {
  DUPLICATE_PAGE_DETAIL_FEATURE_KEY,
  reducer as duplicatePageDetailReducer
} from '@app/library/reducers/duplicate-page-detail.reducer';
import { DuplicatePageDetailEffects } from '@app/library/effects/duplicate-page-detail.effects';
import { MatDividerModule } from '@angular/material/divider';
import {
  reducer as rescanComicsReducer,
  RESCAN_COMICS_FEATURE_KEY
} from '@app/library/reducers/rescan-comics.reducer';
import { RescanComicsEffects } from '@app/library/effects/rescan-comics.effects';
import {
  reducer as updateMetadataReducer,
  UPDATE_METADATA_FEATURE_KEY
} from '@app/library/reducers/update-metadata.reducer';
import { UpdateMetadataEffects } from '@app/library/effects/update-metadata.effects';
import {
  CONSOLIDATE_LIBRARY_FEATURE_KEY,
  reducer as consolidateLibraryReducer
} from '@app/library/reducers/consolidate-library.reducer';
import { ConsolidateLibraryEffects } from '@app/library/effects/consolidate-library.effects';
import {
  CONVERT_COMICS_FEATURE_KEY,
  reducer as convertComicsReducer
} from '@app/library/reducers/convert-comics.reducer';
import { ConvertComicsEffects } from '@app/library/effects/convert-comics.effects';
import {
  PURGE_LIBRARY_FEATURE_KEY,
  reducer as purgeLibraryReducer
} from '@app/library/reducers/purge-library.reducer';
import { PurgeLibraryEffects } from '@app/library/effects/purge-library.effects';
import { EditMultipleComicsComponent } from './components/edit-multiple-comics/edit-multiple-comics.component';
import { LibraryEffects } from '@app/library/effects/library.effects';
import { ComicBookListComponent } from './components/comic-book-list/comic-book-list.component';
import {
  LIBRARY_SELECTIONS_FEATURE_KEY,
  reducer as librarySelectionsReducer
} from '@app/library/reducers/library-selections.reducer';
import { LibrarySelectionsEffects } from '@app/library/effects/library-selections.effects';

@NgModule({
  declarations: [
    LibraryPageComponent,
    SelectedComicsComponent,
    ComicDetailsDialogComponent,
    ScrapingPageComponent,
    ArchiveTypePipe,
    UnreadComicsPipe,
    DuplicatePageListPageComponent,
    ComicsWithDuplicatePageComponent,
    DuplicatePageDetailPageComponent,
    EditMultipleComicsComponent,
    ComicBookListComponent
  ],
  providers: [],
  imports: [
    CommonModule,
    CoreModule,
    ComicBooksModule,
    LibraryRouting,
    ReactiveFormsModule,
    TranslateModule.forRoot(),
    StoreModule.forFeature(LIBRARY_FEATURE_KEY, libraryReducer),
    StoreModule.forFeature(
      LIBRARY_SELECTIONS_FEATURE_KEY,
      librarySelectionsReducer
    ),
    StoreModule.forFeature(
      DUPLICATE_PAGE_LIST_FEATURE_KEY,
      comicsWithDuplicatePagesReducer
    ),
    StoreModule.forFeature(
      DUPLICATE_PAGE_DETAIL_FEATURE_KEY,
      duplicatePageDetailReducer
    ),
    StoreModule.forFeature(LIBRARY_FEATURE_KEY, libraryReducer),
    StoreModule.forFeature(RESCAN_COMICS_FEATURE_KEY, rescanComicsReducer),
    StoreModule.forFeature(UPDATE_METADATA_FEATURE_KEY, updateMetadataReducer),
    StoreModule.forFeature(
      CONSOLIDATE_LIBRARY_FEATURE_KEY,
      consolidateLibraryReducer
    ),
    StoreModule.forFeature(CONVERT_COMICS_FEATURE_KEY, convertComicsReducer),
    StoreModule.forFeature(PURGE_LIBRARY_FEATURE_KEY, purgeLibraryReducer),
    EffectsModule.forFeature([
      LibraryEffects,
      LibrarySelectionsEffects,
      DuplicatePageListEffects,
      DuplicatePageDetailEffects,
      RescanComicsEffects,
      UpdateMetadataEffects,
      ConsolidateLibraryEffects,
      ConvertComicsEffects,
      PurgeLibraryEffects
    ]),
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatTableModule,
    FlexModule,
    MatCheckboxModule,
    MatSortModule,
    MatCardModule,
    MatTooltipModule,
    FormsModule,
    MatTabsModule,
    MatToolbarModule,
    MatExpansionModule,
    MatSliderModule,
    MatListModule,
    MatPaginatorModule,
    MatTreeModule,
    MatBadgeModule,
    MatSidenavModule,
    OverlayModule,
    MatMenuModule,
    MatProgressBarModule,
    MatDividerModule
  ],
  exports: [CommonModule, CoreModule, ArchiveTypePipe]
})
export class LibraryModule {}
