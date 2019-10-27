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
 * along with this program. If not, see <http:/www.gnu.org/licenses/>.package
 * org.comixed;
 */

import {
  ModuleWithProviders,
  NgModule,
  Optional,
  SkipSelf
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import * as fromLibrary from './reducers/library.reducer';
import { EffectsModule } from '@ngrx/effects';
import { LibraryEffects } from './effects/library.effects';
import { LibraryService } from './services/library.service';
import { LibraryAdaptor } from './adaptors/library.adaptor';
import * as fromSelection from './reducers/selection.reducer';
import { SelectionAdaptor } from './adaptors/selection.adaptor';
import * as fromReadingList from './reducers/reading-list.reducer';
import { ReadingListEffects } from './effects/reading-list.effects';
import { ReadingListService } from './services/reading-list.service';
import { ReadingListAdaptor } from './adaptors/reading-list.adaptor';
import { LibraryDisplayAdaptor } from './adaptors/library-display.adaptor';
import * as fromFilters from './reducers/filters.reducer';
import { FilterAdaptor } from 'app/library/adaptors/filter.adaptor';
import { ComicFilterPipe } from './pipes/comic-filter.pipe';
import { ComicListToolbarComponent } from './components/comic-list-toolbar/comic-list-toolbar.component';
import { ComicGridItemComponent } from 'app/library/components/comic-grid-item/comic-grid-item.component';
import { ComicListItemComponent } from 'app/library/components/comic-list-item/comic-list-item.component';
import { ComicListComponent } from 'app/library/components/comic-list/comic-list.component';
import { ComicsModule } from 'app/comics/comics.module';
import { TranslateModule } from '@ngx-translate/core';
import { ContextMenuModule } from 'primeng/contextmenu';
import { CheckboxModule } from 'primeng/checkbox';
import {
    ProgressSpinnerModule,
    ScrollPanelModule, SidebarModule,
    SliderModule,
    ToolbarModule,
    TooltipModule
} from 'primeng/primeng';
import { LibraryFilterComponent } from 'app/library/components/library-filter/library-filter.component';
import { LibraryPageComponent } from 'app/library/pages/library-page/library-page.component';
import { LibraryRoutingModule } from 'app/library/library-routing.module';
import { LibraryFilterPipe } from 'app/library/pipes/library-filter.pipe';
import { PublishersPageComponent } from 'app/library/pages/publishers-page/publishers-page.component';
import { PublisherDetailsPageComponent } from 'app/library/pages/publisher-details-page/publisher-details-page.component';
import { SeriesPageComponent } from 'app/library/pages/series-page/series-page.component';
import { SeriesDetailsPageComponent } from 'app/library/pages/series-details-page/series-details-page.component';
import { CharactersPageComponent } from 'app/library/pages/characters-page/characters-page.component';
import { CharacterDetailsPageComponent } from 'app/library/pages/character-details-page/character-details-page.component';
import { TeamsPageComponent } from 'app/library/pages/teams-page/teams-page.component';
import { TeamDetailsPageComponent } from 'app/library/pages/team-details-page/team-details-page.component';
import { LocationsPageComponent } from 'app/library/pages/locations-page/locations-page.component';
import { LocationDetailsPageComponent } from 'app/library/pages/location-details-page/location-details-page.component';
import { StoryArcsPageComponent } from 'app/library/pages/story-arcs-page/story-arcs-page.component';
import { StoryArcDetailsPageComponent } from 'app/library/pages/story-arc-details-page/story-arc-details-page.component';
import { DuplicatesPageComponent } from 'app/library/pages/duplicates-page/duplicates-page.component';
import { DuplicatePagesViewComponent } from 'app/library/components/duplicate-pages-view/duplicate-pages-view.component';
import { MissingComicsPageComponent } from 'app/library/pages/missing-comics-page/missing-comics-page.component';
import { MultiComicScrapingPageComponent } from 'app/library/pages/multi-comic-scraping-page/multi-comic-scraping-page.component';
import { PageHashViewComponent } from 'app/library/components/page-hash-view/page-hash-view.component';
import { MissingComicsPipe } from 'app/library/pipes/missing-comics.pipe';
import { ScrapingComicListComponent } from 'app/library/components/scraping-comic-list/scraping-comic-list.component';
import { MultipleComicScrapingComponent } from 'app/library/components/multiple-comic-scraping/multiple-comic-scraping.component';

@NgModule({
    imports: [
        CommonModule,
        LibraryRoutingModule,
        ComicsModule,
        TranslateModule.forRoot(),
        StoreModule.forFeature(
            fromLibrary.LIBRARY_FEATURE_KEY,
            fromLibrary.reducer
        ),
        StoreModule.forFeature(
            fromSelection.SELECTION_FEATURE_KEY,
            fromSelection.reducer
        ),
        StoreModule.forFeature(
            fromReadingList.READING_LIST_FEATURE_KEY,
            fromReadingList.reducer
        ),
        StoreModule.forFeature(
            fromFilters.FILTERS_FEATURE_KEY,
            fromFilters.reducer
        ),
        EffectsModule.forFeature([LibraryEffects, ReadingListEffects]),
        ContextMenuModule,
        CheckboxModule,
        SliderModule,
        ScrollPanelModule,
        ToolbarModule,
        ProgressSpinnerModule,
        TooltipModule,
        SidebarModule
    ],
  exports: [CommonModule, ComicsModule, ComicListComponent],
  declarations: [
    LibraryPageComponent,
    ComicGridItemComponent,
    ComicListItemComponent,
    ComicListComponent,
    ComicListToolbarComponent,
    LibraryFilterComponent,
    PublishersPageComponent,
    PublisherDetailsPageComponent,
    SeriesPageComponent,
    SeriesDetailsPageComponent,
    CharactersPageComponent,
    CharacterDetailsPageComponent,
    TeamsPageComponent,
    TeamDetailsPageComponent,
    LocationsPageComponent,
    LocationDetailsPageComponent,
    StoryArcsPageComponent,
    StoryArcDetailsPageComponent,
    DuplicatesPageComponent,
    DuplicatePagesViewComponent,
    MissingComicsPageComponent,
    MultiComicScrapingPageComponent,
    PageHashViewComponent,
    ScrapingComicListComponent,
    MultipleComicScrapingComponent,
    ComicFilterPipe,
    LibraryFilterPipe,
    MissingComicsPipe
  ],
  providers: [
    LibraryService,
    LibraryAdaptor,
    FilterAdaptor,
    LibraryDisplayAdaptor,
    SelectionAdaptor,
    ReadingListService,
    ReadingListAdaptor
  ]
})
export class LibraryModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: LibraryModule
    };
  }

  constructor(@Optional() @SkipSelf() parentModule?: LibraryModule) {
    if (parentModule) {
      throw new Error(
        'LibraryModule is already loaded. Import it in the AppModule only'
      );
    }
  }
}
