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

import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import {
  COMIC_FORMAT_FEATURE_KEY,
  reducer as comicFormatReducer
} from './reducers/comic-format.reducer';
import { EffectsModule } from '@ngrx/effects';
import { ComicFormatEffects } from './effects/comic-format.effects';
import {
  reducer as scanTypeReducer,
  SCAN_TYPE_FEATURE_KEY
} from './reducers/scan-type.reducer';
import { ScanTypeEffects } from './effects/scan-type.effects';
import { ComicBookRouting } from './comic-book.routing';
import { ComicBookPageComponent } from './pages/comic-book-page/comic-book-page.component';
import { ComicEditComponent } from './components/comic-edit/comic-edit.component';
import { ComicOverviewComponent } from './components/comic-overview/comic-overview.component';
import { ComicPagesComponent } from './components/comic-pages/comic-pages.component';
import { ComicPageComponent } from './components/comic-page/comic-page.component';
import { ComicScrapingComponent } from './components/comic-scraping/comic-scraping.component';
import { ComicStoryComponent } from './components/comic-story/comic-story.component';
import { ScrapingIssueDetailComponent } from './components/scraping-issue-detail/scraping-issue-detail.component';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatExpansionModule } from '@angular/material/expansion';
import { ComicDetailCardComponent } from '@app/comic-book/components/comic-detail-card/comic-detail-card.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { ComicCoverUrlPipe } from '@app/comic-book/pipes/comic-cover-url.pipe';
import { ComicPageUrlPipe } from '@app/comic-book/pipes/comic-page-url.pipe';
import { ComicTitlePipe } from '@app/comic-book/pipes/comic-title.pipe';
import { ScrapingIssueTitlePipe } from '@app/comic-book/pipes/scraping-issue-title.pipe';
import {
  reducer as scrapingReducer,
  SCRAPING_FEATURE_KEY
} from '@app/comic-book/reducers/scraping.reducer';
import {
  COMIC_LIST_FEATURE_KEY,
  reducer as comicListReducer
} from '@app/comic-book/reducers/comic-list.reducer';
import {
  COMIC_FEATURE_KEY,
  reducer as comicReducer
} from '@app/comic-book/reducers/comic.reducer';
import { ScrapingEffects } from '@app/comic-book/effects/scraping.effects';
import { ComicListEffects } from '@app/comic-book/effects/comic-list.effects';
import { ComicEffects } from '@app/comic-book/effects/comic.effects';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import {
  reducer as updateComicInfoReducer,
  UPDATE_COMIC_INFO_FEATURE_KEY
} from '@app/comic-book/reducers/update-comic-info.reducer';
import { UpdateComicInfoEffects } from '@app/comic-book/effects/update-comic-info.effects';
import { MatSortModule } from '@angular/material/sort';
import { CoreModule } from '@app/core/core.module';
import { MatGridListModule } from '@angular/material/grid-list';
import { ComicvineIssueLinkPipe } from './pipes/comicvine-issue-link.pipe';

@NgModule({
  declarations: [
    ComicBookPageComponent,
    ComicEditComponent,
    ComicOverviewComponent,
    ComicPagesComponent,
    ComicPageComponent,
    ComicScrapingComponent,
    ComicStoryComponent,
    ScrapingIssueDetailComponent,
    ComicDetailCardComponent,
    ComicCoverUrlPipe,
    ComicPageUrlPipe,
    ComicTitlePipe,
    ScrapingIssueTitlePipe,
    ComicvineIssueLinkPipe
  ],
  imports: [
    CommonModule,
    ComicBookRouting,
    StoreModule.forFeature(COMIC_FORMAT_FEATURE_KEY, comicFormatReducer),
    StoreModule.forFeature(SCAN_TYPE_FEATURE_KEY, scanTypeReducer),
    StoreModule.forFeature(SCRAPING_FEATURE_KEY, scrapingReducer),
    StoreModule.forFeature(COMIC_LIST_FEATURE_KEY, comicListReducer),
    StoreModule.forFeature(COMIC_FEATURE_KEY, comicReducer),
    StoreModule.forFeature(
      UPDATE_COMIC_INFO_FEATURE_KEY,
      updateComicInfoReducer
    ),
    EffectsModule.forFeature([
      ComicFormatEffects,
      ScanTypeEffects,
      ScrapingEffects,
      ComicListEffects,
      ComicEffects,
      UpdateComicInfoEffects
    ]),
    TranslateModule.forRoot(),
    MatCardModule,
    MatTooltipModule,
    MatIconModule,
    MatFormFieldModule,
    MatButtonModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatInputModule,
    MatExpansionModule,
    MatPaginatorModule,
    MatTableModule,
    MatToolbarModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatChipsModule,
    MatSortModule,
    CoreModule,
    MatGridListModule
  ],
  exports: [
    CommonModule,
    ComicPageComponent,
    ComicEditComponent,
    ComicScrapingComponent,
    ComicDetailCardComponent,
    ComicTitlePipe,
    ComicCoverUrlPipe
  ]
})
export class ComicBookModule {
  static forRoot(): ModuleWithProviders<ComicBookModule> {
    return {
      ngModule: ComicBookModule,
      providers: [ComicTitlePipe]
    };
  }
}
