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
  reducer as comicImportReducer,
} from '@app/library/reducers/comic-import.reducer';
import { EffectsModule } from '@ngrx/effects';
import { ComicImportEffects } from '@app/library/effects/comic-import.effects';
import { ComicFileListComponent } from './components/comic-file-list/comic-file-list.component';
import { MatTableModule } from '@angular/material/table';
import { ComicFileCoverUrlPipe } from './pipes/comic-file-cover-url.pipe';
import { ComicFileDetailsComponent } from './components/comic-file-details/comic-file-details.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { FlexModule } from '@angular/flex-layout';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [
    ImportComicsComponent,
    ImportToolbarComponent,
    ComicFileListComponent,
    ComicFileCoverUrlPipe,
    ComicFileDetailsComponent,
  ],
  imports: [
    CommonModule,
    CoreModule,
    LibraryRouting,
    ReactiveFormsModule,
    TranslateModule.forRoot(),
    StoreModule.forFeature(COMIC_IMPORT_FEATURE_KEY, comicImportReducer),
    EffectsModule.forFeature([ComicImportEffects]),
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatTableModule,
    MatGridListModule,
    FlexModule,
    MatCheckboxModule,
    MatSortModule,
    MatCardModule,
    MatTooltipModule,
    FormsModule,
  ],
  exports: [CommonModule, CoreModule],
})
export class LibraryModule {}
