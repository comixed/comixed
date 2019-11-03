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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import {
  ModuleWithProviders,
  NgModule,
  Optional,
  SkipSelf
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComicCoverComponent } from 'app/comics/components/comic-cover/comic-cover.component';
import { ComicOverviewComponent } from 'app/comics/components/comic-overview/comic-overview.component';
import { ComicStoryComponent } from 'app/comics/components/comic-story/comic-story.component';
import { ComicCreditsComponent } from 'app/comics/components/comic-credits/comic-credits.component';
import { ComicPagesComponent } from 'app/comics/components/comic-pages/comic-pages.component';
import { ComicDetailsEditorComponent } from 'app/comics/components/comic-details-editor/comic-details-editor.component';
import { CardModule } from 'primeng/card';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InplaceModule } from 'primeng/inplace';
import { PanelModule } from 'primeng/panel';
import { DataViewModule } from 'primeng/dataview';
import { ComicGroupingCardComponent } from 'app/comics/components/comic-grouping-card/comic-grouping-card.component';
import { ComicPageUrlPipe } from 'app/comics/pipes/comic-page-url.pipe';
import { BlockUIModule } from 'primeng/blockui';
import {
  InputTextModule,
  ProgressBarModule,
  ProgressSpinnerModule,
  SplitButtonModule,
  TabViewModule,
  ToolbarModule,
  TooltipModule
} from 'primeng/primeng';
import { VolumeListComponent } from 'app/comics/components/volume-list/volume-list.component';
import { TableModule } from 'primeng/table';
import { ScrapingIssueTitlePipe } from 'app/comics/pipes/scraping-issue-title.pipe';
import { StoreModule } from '@ngrx/store';
import * as fromComics from './reducers/comic.reducer';
import * as fromScraping from './reducers/scraping.reducer';
import { ComicEffects } from 'app/comics/effects/comic.effects';
import { EffectsModule } from '@ngrx/effects';
import { ComicService } from 'app/comics/services/comic.service';
import { ComicAdaptor } from 'app/comics/adaptors/comic.adaptor';
import { ComicDetailsPageComponent } from 'app/comics/pages/comic-details-page/comic-details-page.component';
import { ComicsRoutingModule } from 'app/comics/comics-routing.module';
import { ComicTitlePipe } from 'app/comics/pipes/comic-title.pipe';
import { ComicCoverUrlPipe } from 'app/comics/pipes/comic-cover-url.pipe';
import { ComicDownloadLinkPipe } from 'app/comics/pipes/comic-download-link.pipe';
import { UserModule } from 'app/user/user.module';
import { PageService } from 'app/comics/services/page.service';
import { ScrapingEffects } from 'app/comics/effects/scraping.effects';
import { ScrapingAdaptor } from 'app/comics/adaptors/scraping.adaptor';
import { ScrapingService } from 'app/comics/services/scraping.service';
import { ScrapingIssueCoverUrlPipe } from './pipes/scraping-issue-cover-url.pipe';

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
    ScrapingIssueCoverUrlPipe
  ],
  imports: [
    UserModule,
    ComicsRoutingModule,
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
      fromScraping.SCRAPING_FEATURE_KEY,
      fromScraping.reducer
    ),
    EffectsModule.forFeature([ComicEffects, ScrapingEffects]),
    ProgressSpinnerModule,
    TooltipModule,
    InputTextModule,
    ToolbarModule
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
    ComicTitlePipe
  ],
  providers: [
    ComicAdaptor,
    ComicService,
    ScrapingAdaptor,
    ScrapingService,
    PageService
  ]
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
