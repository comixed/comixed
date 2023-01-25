/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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
import { StoreModule } from '@ngrx/store';
import {
  METADATA_SOURCE_LIST_FEATURE_KEY,
  reducer as metadataSourceListReducer
} from '@app/comic-metadata/reducers/metadata-source-list.reducer';
import { EffectsModule } from '@ngrx/effects';
import { MetadataSourceListEffects } from '@app/comic-metadata/effects/metadata-source-list.effects';
import { TranslateModule } from '@ngx-translate/core';
import {
  METADATA_SOURCE_FEATURE_KEY,
  reducer as metadataSourceReducer
} from '@app/comic-metadata/reducers/metadata-source.reducer';
import { MetadataSourceEffects } from '@app/comic-metadata/effects/metadata-source.effects';
import { MetadataProcessPageComponent } from './pages/metadata-process-page/metadata-process-page.component';
import { ComicMetadataRouting } from '@app/comic-metadata/comic-metadata.routing';
import { MetadataProcessToolbarComponent } from './components/metadata-process-toolbar/metadata-process-toolbar.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MetadataProcessStatusComponent } from './components/metadata-process-status/metadata-process-status.component';
import {
  METADATA_UPDATE_PROCESS_FEATURE_KEY,
  reducer as metadataUpdateProcessReducer
} from '@app/comic-metadata/reducers/metadata-update-process.reducer';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FetchIssuesPageComponent } from './pages/fetch-issues-page/fetch-issues-page.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import {
  FETCH_ISSUES_FOR_SERIES_FEATURE_KEY,
  reducer as fetchIssuesForSeriesReducer
} from '@app/comic-metadata/reducers/fetch-issues-for-series.reducer';
import { FetchIssuesForSeriesEffects } from '@app/comic-metadata/effects/fetch-issues-for-series.effects';
import {
  METADATA_FEATURE_KEY,
  reducer as scrapingReducer
} from '@app/comic-metadata/reducers/metadata.reducer';
import { MetadataEffects } from '@app/comic-metadata/effects/metadata.effects';
import { ComicBooksModule } from '@app/comic-books/comic-books.module';

@NgModule({
  declarations: [
    MetadataProcessPageComponent,
    MetadataProcessToolbarComponent,
    MetadataProcessStatusComponent,
    FetchIssuesPageComponent
  ],
  imports: [
    CommonModule,
    ComicMetadataRouting,
    TranslateModule.forRoot(),
    StoreModule.forFeature(METADATA_FEATURE_KEY, scrapingReducer),
    StoreModule.forFeature(
      METADATA_SOURCE_LIST_FEATURE_KEY,
      metadataSourceListReducer
    ),
    StoreModule.forFeature(METADATA_SOURCE_FEATURE_KEY, metadataSourceReducer),
    StoreModule.forFeature(
      METADATA_UPDATE_PROCESS_FEATURE_KEY,
      metadataUpdateProcessReducer
    ),
    StoreModule.forFeature(
      FETCH_ISSUES_FOR_SERIES_FEATURE_KEY,
      fetchIssuesForSeriesReducer
    ),
    EffectsModule.forFeature([
      MetadataEffects,
      MetadataSourceListEffects,
      MetadataSourceEffects,
      FetchIssuesForSeriesEffects
    ]),
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressBarModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatSortModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatCardModule,
    ComicBooksModule
  ],
  exports: [CommonModule]
})
export class ComicMetadataModule {}
