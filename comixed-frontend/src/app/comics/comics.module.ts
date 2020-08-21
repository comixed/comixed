/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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

import { CommonModule } from '@angular/common';
import {
  ModuleWithProviders,
  NgModule,
  Optional,
  SkipSelf
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { ComicAdaptor } from 'app/comics/adaptors/comic.adaptor';
import { ComicsRoutingModule } from 'app/comics/comics-routing.module';
import { ComicCoverComponent } from 'app/comics/components/comic-cover/comic-cover.component';
import { ComicCreditsComponent } from 'app/comics/components/comic-credits/comic-credits.component';
import { ComicDetailsEditorComponent } from 'app/comics/components/comic-details-editor/comic-details-editor.component';
import { ComicGroupingCardComponent } from 'app/comics/components/comic-grouping-card/comic-grouping-card.component';
import { ComicOverviewComponent } from 'app/comics/components/comic-overview/comic-overview.component';
import { ComicPagesComponent } from 'app/comics/components/comic-pages/comic-pages.component';
import { ComicStoryComponent } from 'app/comics/components/comic-story/comic-story.component';
import { VolumeListComponent } from 'app/comics/components/volume-list/volume-list.component';
import { ComicEffects } from 'app/comics/effects/comic.effects';
import { ComicDetailsPageComponent } from 'app/comics/pages/comic-details-page/comic-details-page.component';
import { ComicCoverUrlPipe } from 'app/comics/pipes/comic-cover-url.pipe';
import { ComicDownloadLinkPipe } from 'app/comics/pipes/comic-download-link.pipe';
import { ComicPageUrlPipe } from 'app/comics/pipes/comic-page-url.pipe';
import { ComicTitlePipe } from 'app/comics/pipes/comic-title.pipe';
import { ScrapingIssueTitlePipe } from 'app/comics/pipes/scraping-issue-title.pipe';
import { ComicService } from 'app/comics/services/comic.service';
import { PageService } from 'app/comics/services/page.service';
import { ScrapingService } from 'app/comics/services/scraping.service';
import { UserExperienceModule } from 'app/user-experience/user-experience.module';
import { UserModule } from 'app/user/user.module';
import { BlockUIModule } from 'primeng/blockui';
import { CardModule } from 'primeng/card';
import { DataViewModule } from 'primeng/dataview';
import { DropdownModule } from 'primeng/dropdown';
import { InplaceModule } from 'primeng/inplace';
import { PanelModule } from 'primeng/panel';
import {
  AutoCompleteModule,
  ContextMenuModule,
  DialogModule,
  InputTextModule,
  ProgressBarModule,
  ProgressSpinnerModule,
  ScrollPanelModule,
  SplitButtonModule,
  TabViewModule,
  ToolbarModule,
  TooltipModule
} from 'primeng/primeng';
import { TableModule } from 'primeng/table';
import { ScrapingIssueCoverUrlPipe } from 'app/comics/pipes/scraping-issue-cover-url.pipe';
import * as fromComics from 'app/comics/reducers/comic.reducer';
import { PublisherThumbnailUrlPipe } from 'app/comics/pipes/publisher-thumbnail-url.pipe';
import { PublisherPipe } from 'app/comics/pipes/publisher.pipe';
import { SeriesCollectionNamePipe } from 'app/comics/pipes/series-collection-name.pipe';
import { FileEntryListComponent } from 'app/comics/components/file-entry-list/file-entry-list.component';
import * as fromScrapingIssue from 'app/comics/reducers/scraping-issue.reducer';
import { SCRAPING_ISSUE_FEATURE_KEY } from 'app/comics/reducers/scraping-issue.reducer';
import { ScrapingIssueEffects } from 'app/comics/effects/scraping-issue.effects';
import * as fromScrapingVolumes from 'app/comics/reducers/scraping-volumes.reducer';
import { SCRAPING_VOLUMES_FEATURE_KEY } from 'app/comics/reducers/scraping-volumes.reducer';
import { ScrapingVolumesEffects } from 'app/comics/effects/scraping-volumes.effects';
import * as fromScrapeComic from 'app/comics/reducers/scrape-comic.reducer';
import { SCRAPE_COMIC_FEATURE_KEY } from 'app/comics/reducers/scrape-comic.reducer';
import { ScrapeComicEffects } from 'app/comics/effects/scrape-comic.effects';
import * as fromScrapeMultipleComics from 'app/comics/reducers/scrape-multiple-comic.reducer';
import { SCRAPE_MULTIPLE_COMICS_STATE } from 'app/comics/reducers/scrape-multiple-comic.reducer';

@NgModule({
  declarations: [
    ComicDetailsPageComponent,
    ComicCoverComponent,
    ComicOverviewComponent,
    ComicStoryComponent,
    ComicCreditsComponent,
    ComicPagesComponent,
    ComicDetailsEditorComponent,
    ComicGroupingCardComponent,
    VolumeListComponent,
    ComicPageUrlPipe,
    ScrapingIssueTitlePipe,
    ComicTitlePipe,
    ComicCoverUrlPipe,
    ComicDownloadLinkPipe,
    ScrapingIssueCoverUrlPipe,
    PublisherThumbnailUrlPipe,
    PublisherPipe,
    SeriesCollectionNamePipe,
    FileEntryListComponent
  ],
  imports: [
    UserModule,
    ComicsRoutingModule,
    UserExperienceModule,
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    CardModule,
    DropdownModule,
    InplaceModule,
    PanelModule,
    DataViewModule,
    BlockUIModule,
    ProgressBarModule,
    TooltipModule,
    SplitButtonModule,
    TableModule,
    TabViewModule,
    TranslateModule.forRoot(),
    StoreModule.forFeature(fromComics.COMIC_FEATURE_KEY, fromComics.reducer),
    StoreModule.forFeature(
      SCRAPING_VOLUMES_FEATURE_KEY,
      fromScrapingVolumes.reducer
    ),
    StoreModule.forFeature(
      SCRAPING_ISSUE_FEATURE_KEY,
      fromScrapingIssue.reducer
    ),
    StoreModule.forFeature(SCRAPE_COMIC_FEATURE_KEY, fromScrapeComic.reducer),
    StoreModule.forFeature(
      SCRAPE_MULTIPLE_COMICS_STATE,
      fromScrapeMultipleComics.reducer
    ),
    EffectsModule.forFeature([
      ComicEffects,
      ScrapingVolumesEffects,
      ScrapingIssueEffects,
      ScrapeComicEffects
    ]),
    ProgressSpinnerModule,
    TooltipModule,
    InputTextModule,
    ToolbarModule,
    ContextMenuModule,
    AutoCompleteModule,
    DialogModule,
    ScrollPanelModule
  ],
  exports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    CardModule,
    DropdownModule,
    InplaceModule,
    PanelModule,
    DataViewModule,
    BlockUIModule,
    ProgressBarModule,
    TooltipModule,
    SplitButtonModule,
    TableModule,
    TabViewModule,
    ComicCoverComponent,
    ComicOverviewComponent,
    ComicStoryComponent,
    ComicCreditsComponent,
    ComicPagesComponent,
    ComicDetailsEditorComponent,
    ComicGroupingCardComponent,
    VolumeListComponent,
    ComicPageUrlPipe,
    ComicCoverUrlPipe,
    ComicTitlePipe,
    SeriesCollectionNamePipe
  ],
  providers: [ComicAdaptor, ComicService, ScrapingService, PageService]
})
export class ComicsModule {
  constructor(@Optional() @SkipSelf() parentModule?: ComicsModule) {
    if (parentModule) {
      throw new Error(
        'ComicsModule is already loaded. Import it in the AppModule only'
      );
    }
  }

  static forRoot(): ModuleWithProviders {
    return {
      ngModule: ComicsModule
    };
  }
}
