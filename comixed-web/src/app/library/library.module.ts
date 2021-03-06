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
import { ComicFileToolbarComponent } from './components/comic-file-toolbar/comic-file-toolbar.component';
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
import { LibraryComponent } from './pages/library/library.component';
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
import { NavigationPaneComponent } from './components/navigation-pane/navigation-pane.component';
import { MatTreeModule } from '@angular/material/tree';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ComicCoversComponent } from './components/comic-covers/comic-covers.component';
import { LibraryGroupComponent } from './pages/library-group/library-group.component';
import { LibraryToolbarComponent } from './components/library-toolbar/library-toolbar.component';
import { ScrapingComponent } from './pages/scraping/scraping.component';
import { SelectedComicsComponent } from './components/selected-comics/selected-comics.component';
import { OverlayModule } from '@angular/cdk/overlay';
import { ComicDetailsDialogComponent } from './components/comic-details-dialog/comic-details-dialog.component';
import { MatMenuModule } from '@angular/material/menu';
import { DeletedComicsPipe } from './pipes/deleted-comics.pipe';
import {
  BLOCKED_PAGE_FEATURE_KEY,
  reducer as blockedPageReducer
} from '@app/library/reducers/blocked-page.reducer';
import { BlockedPageEffects } from '@app/library/effects/blocked-page.effects';
import { ComicPageComponent } from '@app/library/components/comic-page/comic-page.component';
import { ComicDetailCardComponent } from '@app/library/components/comic-detail-card/comic-detail-card.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@NgModule({
  declarations: [
    ImportComicsComponent,
    ComicFileToolbarComponent,
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
    ComicPageUrlPipe,
    LibraryComponent,
    ComicDisplayOptionsComponent,
    ComicScrapingComponent,
    ScrapingIssueDetailComponent,
    ScrapingIssueTitlePipe,
    MatchabilityPipe,
    NavigationPaneComponent,
    ComicCoversComponent,
    LibraryGroupComponent,
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
    StoreModule.forFeature(COMIC_IMPORT_FEATURE_KEY, comicImportReducer),
    StoreModule.forFeature(LIBRARY_FEATURE_KEY, libraryReducer),
    StoreModule.forFeature(SCRAPING_FEATURE_KEY, scrapingReducer),
    StoreModule.forFeature(BLOCKED_PAGE_FEATURE_KEY, blockedPageReducer),
    EffectsModule.forFeature([
      DisplayEffects,
      ComicImportEffects,
      LibraryEffects,
      ScrapingEffects,
      BlockedPageEffects
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
  exports: [CommonModule, CoreModule]
})
export class LibraryModule {}
