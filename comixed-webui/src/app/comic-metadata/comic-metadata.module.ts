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
import { metadataSourceListFeature } from '@app/comic-metadata/reducers/metadata-source-list.reducer';
import { EffectsModule } from '@ngrx/effects';
import { MetadataSourceListEffects } from '@app/comic-metadata/effects/metadata-source-list.effects';
import { TranslateModule } from '@ngx-translate/core';
import { metadataSourceFeature } from '@app/comic-metadata/reducers/metadata-source.reducer';
import { MetadataSourceEffects } from '@app/comic-metadata/effects/metadata-source.effects';
import { MetadataProcessPageComponent } from './pages/metadata-process-page/metadata-process-page.component';
import { ComicMetadataRouting } from '@app/comic-metadata/comic-metadata.routing';
import { MetadataProcessToolbarComponent } from './components/metadata-process-toolbar/metadata-process-toolbar.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MetadataProcessStatusComponent } from './components/metadata-process-status/metadata-process-status.component';
import { metadataUpdateProcessFeature } from '@app/comic-metadata/reducers/metadata-update-process.reducer';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ScrapingSeriesPageComponent } from '@app/comic-metadata/pages/scraping-series-page/scraping-series-page.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { scrapeSeriesFeature } from '@app/comic-metadata/reducers/scrape-series.reducer';
import { SeriesScrapingEffects } from '@app/comic-metadata/effects/series-scraping.effects';
import { singleBookScrapingFeature } from '@app/comic-metadata/reducers/single-book-scraping.reducer';
import { SingleBookScrapingEffects } from '@app/comic-metadata/effects/single-book-scraping.effects';
import { ComicBooksModule } from '@app/comic-books/comic-books.module';
import { multiBookScrapingFeature } from '@app/comic-metadata/reducers/multi-book-scraping.reducer';
import { MultiBookScrapingEffects } from '@app/comic-metadata/effects/multi-book-scraping.effects';
import { ScrapingIssuesPageComponent } from '@app/comic-metadata/pages/scraping-issues-page/scraping-issues-page.component';
import { MatDialogContainer, MatDialogContent } from '@angular/material/dialog';
import { scrapeStoryFeature } from '@app/comic-metadata/reducers/scrape-story.reducer';
import { ScrapeStoryEffects } from '@app/comic-metadata/effects/scrape-story.effects';

@NgModule({
  declarations: [
    ScrapingIssuesPageComponent,
    MetadataProcessPageComponent,
    MetadataProcessToolbarComponent,
    MetadataProcessStatusComponent,
    ScrapingSeriesPageComponent
  ],
  imports: [
    CommonModule,
    ComicMetadataRouting,
    TranslateModule.forRoot(),
    StoreModule.forFeature(singleBookScrapingFeature),
    StoreModule.forFeature(metadataSourceListFeature),
    StoreModule.forFeature(metadataSourceFeature),
    StoreModule.forFeature(metadataUpdateProcessFeature),
    StoreModule.forFeature(scrapeSeriesFeature),
    StoreModule.forFeature(multiBookScrapingFeature),
    StoreModule.forFeature(scrapeStoryFeature),
    EffectsModule.forFeature([
      SingleBookScrapingEffects,
      MetadataSourceListEffects,
      MetadataSourceEffects,
      SeriesScrapingEffects,
      MultiBookScrapingEffects,
      ScrapeStoryEffects
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
    ComicBooksModule,
    MatDialogContent,
    MatDialogContainer
  ],
  exports: [CommonModule]
})
export class ComicMetadataModule {}
