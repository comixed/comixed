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
import { CollectionListComponent } from './pages/collection-list/collection-list.component';
import { CollectionDetailComponent } from './pages/collection-detail/collection-detail.component';
import { CollectionsRouting } from './collections.routing';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { TranslateModule } from '@ngx-translate/core';
import { LibraryModule } from '@app/library/library.module';
import { ComicBooksModule } from '@app/comic-books/comic-books.module';
import { SeriesListPageComponent } from './pages/series-list-page/series-list-page.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { StoreModule } from '@ngrx/store';
import {
  reducer as seriesReducer,
  SERIES_FEATURE_KEY
} from '@app/collections/reducers/series.reducer';
import { EffectsModule } from '@ngrx/effects';
import { SeriesEffects } from '@app/collections/effects/series.effects';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { SeriesDetailPageComponent } from './pages/series-detail-page/series-detail-page.component';
import { PublisherListPageComponent } from './pages/publisher-list-page/publisher-list-page.component';
import {
  PUBLISHER_FEATURE_KEY,
  reducer as publisherReducer
} from '@app/collections/reducers/publisher.reducer';
import { PublisherEffects } from '@app/collections/effects/publisher.effects';
import { PublisherDetailPageComponent } from './pages/publisher-detail-page/publisher-detail-page.component';
import { MatDividerModule } from '@angular/material/divider';
import { SeriesDetailNamePipe } from './pipes/series-detail-name.pipe';

@NgModule({
  declarations: [
    CollectionListComponent,
    CollectionDetailComponent,
    SeriesListPageComponent,
    SeriesDetailPageComponent,
    PublisherListPageComponent,
    PublisherDetailPageComponent,
    SeriesDetailNamePipe
  ],
  imports: [
    CommonModule,
    CollectionsRouting,
    TranslateModule.forRoot(),
    StoreModule.forFeature(PUBLISHER_FEATURE_KEY, publisherReducer),
    StoreModule.forFeature(SERIES_FEATURE_KEY, seriesReducer),
    EffectsModule.forFeature([PublisherEffects, SeriesEffects]),
    MatTableModule,
    MatSortModule,
    LibraryModule,
    ComicBooksModule,
    MatPaginatorModule,
    MatButtonModule,
    MatTooltipModule,
    MatSelectModule,
    MatToolbarModule,
    MatInputModule,
    MatDividerModule
  ],
  exports: [CommonModule]
})
export class CollectionsModule {}
