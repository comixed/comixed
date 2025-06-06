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
import { CommonModule, NgOptimizedImage } from '@angular/common';
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
import { seriesFeature } from '@app/collections/reducers/series.reducer';
import { EffectsModule } from '@ngrx/effects';
import { SeriesEffects } from '@app/collections/effects/series.effects';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { SeriesMetadataPageComponent } from '@app/collections/pages/series-metadata-page/series-metadata-page.component';
import { PublisherListPageComponent } from './pages/publisher-list-page/publisher-list-page.component';
import { publisherFeature } from '@app/collections/reducers/publisher.reducer';
import { PublisherEffects } from '@app/collections/effects/publisher.effects';
import { PublisherSeriesPageComponent } from '@app/collections/pages/publisher-series-page/publisher-series-page.component';
import { MatDividerModule } from '@angular/material/divider';
import { SeriesDetailNamePipe } from './pipes/series-detail-name.pipe';
import { collectionListFeature } from '@app/collections/reducers/collection-list.reducer';
import { CollectionListEffects } from '@app/collections/effects/collection-list.effects';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { PublisherIssuesPageComponent } from '@app/collections/pages/publisher-issues-page/publisher-issues-page.component';
import { SeriesIssuePageComponent } from '@app/collections/pages/series-issue-page/series-issue-page.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FilterTextFormComponent } from '@app/collections/components/filter-text-form/filter-text-form.component';
import { MatCardModule } from '@angular/material/card';
import { StoryScrapingComponent } from '@app/collections/components/story-scraping/story-scraping.component';
import { StoryDetailPageComponent } from '@app/collections/pages/story-detail-page/story-detail-page.component';

@NgModule({
  declarations: [
    CollectionListComponent,
    CollectionDetailComponent,
    SeriesListPageComponent,
    SeriesIssuePageComponent,
    SeriesMetadataPageComponent,
    PublisherListPageComponent,
    PublisherSeriesPageComponent,
    PublisherIssuesPageComponent,
    FilterTextFormComponent,
    StoryDetailPageComponent,
    StoryScrapingComponent,
    SeriesDetailNamePipe
  ],
  imports: [
    CommonModule,
    CollectionsRouting,
    TranslateModule.forRoot(),
    StoreModule.forFeature(publisherFeature),
    StoreModule.forFeature(seriesFeature),
    StoreModule.forFeature(collectionListFeature),
    EffectsModule.forFeature([
      PublisherEffects,
      SeriesEffects,
      CollectionListEffects
    ]),
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
    MatDividerModule,
    MatTab,
    MatTabGroup,
    ReactiveFormsModule,
    MatCardModule,
    NgOptimizedImage
  ],
  exports: [CommonModule]
})
export class CollectionsModule {}
