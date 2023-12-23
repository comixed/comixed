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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { libraryFeature } from '@app/library/reducers/library.reducer';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatExpansionModule } from '@angular/material/expansion';
import { LibraryPageComponent } from './pages/library-page/library-page.component';
import { MatSliderModule } from '@angular/material/slider';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTreeModule } from '@angular/material/tree';
import { MatSidenavModule } from '@angular/material/sidenav';
import { SelectedComicsComponent } from './components/selected-comics/selected-comics.component';
import { OverlayModule } from '@angular/cdk/overlay';
import { ComicDetailsDialogComponent } from './components/comic-details-dialog/comic-details-dialog.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ComicBooksModule } from '@app/comic-books/comic-books.module';
import { ArchiveTypePipe } from './pipes/archive-type.pipe';
import { duplicatePageListFeature } from '@app/library/reducers/duplicate-page-list.reducer';
import { DuplicatePageListEffects } from '@app/library/effects/duplicate-page-list.effects';
import { DuplicatePageListPageComponent } from './pages/duplicate-page-list-page/duplicate-page-list-page.component';
import { ComicDetailListDialogComponent } from './components/comic-detail-list-dialog/comic-detail-list-dialog.component';
import { DuplicatePageDetailPageComponent } from './pages/duplicate-page-detail-page/duplicate-page-detail-page.component';
import { duplicatePageDetailFeature } from '@app/library/reducers/duplicate-page-detail.reducer';
import { DuplicatePageDetailEffects } from '@app/library/effects/duplicate-page-detail.effects';
import { MatDividerModule } from '@angular/material/divider';
import { rescanComicBooksFeature } from '@app/library/reducers/rescan-comics.reducer';
import { RescanComicsEffects } from '@app/library/effects/rescan-comics.effects';
import { updateMetadataFeature } from '@app/library/reducers/update-metadata.reducer';
import { UpdateMetadataEffects } from '@app/library/effects/update-metadata.effects';
import { consolidateLibraryFeature } from '@app/library/reducers/consolidate-library.reducer';
import { ConsolidateLibraryEffects } from '@app/library/effects/consolidate-library.effects';
import { convertComicBooksFeature } from '@app/library/reducers/convert-comic-books.reducer';
import { ConvertComicBooksEffects } from '@app/library/effects/convert-comic-books.effects';
import { purgeLibraryFeature } from '@app/library/reducers/purge-library.reducer';
import { PurgeLibraryEffects } from '@app/library/effects/purge-library.effects';
import { EditMultipleComicsComponent } from './components/edit-multiple-comics/edit-multiple-comics.component';
import { LibraryEffects } from '@app/library/effects/library.effects';
import { ComicBookListComponent } from './components/comic-book-list/comic-book-list.component';
import { FlexLayoutModule } from '@angular-ru/cdk/flex-layout';

@NgModule({
  declarations: [
    LibraryPageComponent,
    SelectedComicsComponent,
    ComicDetailsDialogComponent,
    ArchiveTypePipe,
    DuplicatePageListPageComponent,
    ComicDetailListDialogComponent,
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
    StoreModule.forFeature(libraryFeature),
    StoreModule.forFeature(duplicatePageListFeature),
    StoreModule.forFeature(duplicatePageDetailFeature),
    StoreModule.forFeature(rescanComicBooksFeature),
    StoreModule.forFeature(updateMetadataFeature),
    StoreModule.forFeature(consolidateLibraryFeature),
    StoreModule.forFeature(convertComicBooksFeature),
    StoreModule.forFeature(purgeLibraryFeature),
    EffectsModule.forFeature([
      LibraryEffects,
      DuplicatePageListEffects,
      DuplicatePageDetailEffects,
      RescanComicsEffects,
      UpdateMetadataEffects,
      ConsolidateLibraryEffects,
      ConvertComicBooksEffects,
      PurgeLibraryEffects
    ]),
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatTableModule,
    FlexLayoutModule,
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
    MatSidenavModule,
    OverlayModule,
    MatMenuModule,
    MatProgressBarModule,
    MatDividerModule
  ],
  exports: [CommonModule, CoreModule, ArchiveTypePipe]
})
export class LibraryModule {}
