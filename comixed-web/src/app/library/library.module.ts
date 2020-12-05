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
import { ImportComicsComponent } from './pages/import-comics/import-comics.component';
import { ImportToolbarComponent } from './components/import-toolbar/import-toolbar.component';
import { LibraryRouting } from '@app/library/library.routing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { StoreModule } from '@ngrx/store';
import {
  COMIC_IMPORT_FEATURE_KEY,
  reducer as comicImportReducer
} from '@app/library/reducers/comic-import.reducer';
import { EffectsModule } from '@ngrx/effects';
import { ComicImportEffects } from '@app/library/effects/comic-import.effects';
import { ComicFileListComponent } from './components/comic-file-list/comic-file-list.component';
import { MatTableModule } from '@angular/material/table';
import { ComicFileCoverUrlPipe } from './pipes/comic-file-cover-url.pipe';
import { ComicFileDetailsComponent } from './components/comic-file-details/comic-file-details.component';
import { FlexModule } from '@angular/flex-layout';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  COMIC_FEATURE_KEY,
  reducer as comicReducer
} from '@app/library/reducers/comic.reducer';
import { ComicEffects } from '@app/library/effects/comic.effects';
import { ComicDetailsComponent } from './pages/comic-details/comic-details.component';
import { MatTabsModule } from '@angular/material/tabs';
import { ComicOverviewComponent } from './components/comic-overview/comic-overview.component';
import { ComicStoryComponent } from './components/comic-story/comic-story.component';
import { ComicPagesComponent } from './components/comic-pages/comic-pages.component';
import { ComicEditComponent } from './components/comic-edit/comic-edit.component';
import { ComicCoverUrlPipe } from './pipes/comic-cover-url.pipe';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ComicTitlePipe } from './pipes/comic-title.pipe';
import { MatExpansionModule } from '@angular/material/expansion';
import { ComicPageUrlPipe } from './pipes/comic-page-url.pipe';

@NgModule({
  declarations: [
    ImportComicsComponent,
    ImportToolbarComponent,
    ComicFileListComponent,
    ComicFileCoverUrlPipe,
    ComicFileDetailsComponent,
    ComicDetailsComponent,
    ComicOverviewComponent,
    ComicStoryComponent,
    ComicPagesComponent,
    ComicEditComponent,
    ComicCoverUrlPipe,
    ComicTitlePipe,
    ComicPageUrlPipe
  ],
  imports: [
    CommonModule,
    CoreModule,
    LibraryRouting,
    ReactiveFormsModule,
    TranslateModule.forRoot(),
    StoreModule.forFeature(COMIC_IMPORT_FEATURE_KEY, comicImportReducer),
    StoreModule.forFeature(COMIC_FEATURE_KEY, comicReducer),
    EffectsModule.forFeature([ComicImportEffects, ComicEffects]),
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
    MatExpansionModule
  ],
  exports: [CommonModule, CoreModule]
})
export class LibraryModule {}
