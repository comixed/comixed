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
import { LibraryEffects } from '@app/library/effects/library.effects';
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
import { LibraryPageComponent } from './pages/library-page/library-page.component';
import {
  DISPLAY_FEATURE_KEY,
  reducer as displayReducer
} from '@app/library/reducers/display.reducer';
import { DisplayEffects } from '@app/library/effects/display.effects';
import { ComicDisplayOptionsComponent } from './components/comic-display-options/comic-display-options.component';
import { MatSliderModule } from '@angular/material/slider';
import { MatListModule } from '@angular/material/list';
import { ComicScrapingComponent } from './components/comic-scraping/comic-scraping.component';
import {
  reducer as scrapingReducer,
  SCRAPING_FEATURE_KEY
} from '@app/library/reducers/scraping.reducer';
import { ScrapingEffects } from '@app/library/effects/scraping.effects';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ScrapingIssueDetailComponent } from './components/scraping-issue-detail/scraping-issue-detail.component';
import { ScrapingIssueTitlePipe } from './pipes/scraping-issue-title.pipe';
import { MatchabilityPipe } from './pipes/matchability.pipe';
import { MatTreeModule } from '@angular/material/tree';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ComicCoversComponent } from './components/comic-covers/comic-covers.component';
import { LibraryToolbarComponent } from './components/library-toolbar/library-toolbar.component';
import { ScrapingComponent } from './pages/scraping/scraping.component';
import { SelectedComicsComponent } from './components/selected-comics/selected-comics.component';
import { OverlayModule } from '@angular/cdk/overlay';
import { ComicDetailsDialogComponent } from './components/comic-details-dialog/comic-details-dialog.component';
import { MatMenuModule } from '@angular/material/menu';
import { DeletedComicsPipe } from './pipes/deleted-comics.pipe';
import { ComicPageComponent } from '@app/library/components/comic-page/comic-page.component';
import { ComicDetailCardComponent } from '@app/library/components/comic-detail-card/comic-detail-card.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import {
  reducer as scanTypeReducer,
  SCAN_TYPE_FEATURE_KEY
} from '@app/comic/reducers/scan-type.reducer';
import { ScanTypeEffects } from '@app/comic/effects/scan-type.effects';
import { ComicListEffects } from '@app/library/effects/comic-list.effects';
import {
  COMIC_LIST_FEATURE_KEY,
  reducer as comicListReducer
} from '@app/library/reducers/comic-list.reducer';
import {
  COMIC_FEATURE_KEY,
  reducer as comicReducer
} from '@app/library/reducers/comic.reducer';
import { ComicEffects } from '@app/library/effects/comic.effects';

@NgModule({
  declarations: [
    ComicDetailsComponent,
    ComicOverviewComponent,
    ComicStoryComponent,
    ComicPagesComponent,
    ComicEditComponent,
    ComicCoverUrlPipe,
    ComicTitlePipe,
    ComicPageUrlPipe,
    LibraryPageComponent,
    ComicDisplayOptionsComponent,
    ComicScrapingComponent,
    ScrapingIssueDetailComponent,
    ScrapingIssueTitlePipe,
    MatchabilityPipe,
    ComicCoversComponent,
    LibraryToolbarComponent,
    ScrapingComponent,
    SelectedComicsComponent,
    ComicDetailsDialogComponent,
    DeletedComicsPipe,
    ComicPageComponent,
    ComicDetailCardComponent
  ],
  providers: [ComicTitlePipe],
  imports: [
    CommonModule,
    CoreModule,
    LibraryRouting,
    ReactiveFormsModule,
    TranslateModule.forRoot(),
    StoreModule.forFeature(DISPLAY_FEATURE_KEY, displayReducer),
    StoreModule.forFeature(LIBRARY_FEATURE_KEY, libraryReducer),
    StoreModule.forFeature(SCRAPING_FEATURE_KEY, scrapingReducer),
    StoreModule.forFeature(COMIC_LIST_FEATURE_KEY, comicListReducer),
    StoreModule.forFeature(COMIC_FEATURE_KEY, comicReducer),
    EffectsModule.forFeature([
      DisplayEffects,
      LibraryEffects,
      ScrapingEffects,
      ComicListEffects,
      ComicEffects
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
    MatProgressBarModule
  ],
  exports: [CommonModule, CoreModule, ComicCoversComponent, ComicPageComponent]
})
export class LibraryModule {}
