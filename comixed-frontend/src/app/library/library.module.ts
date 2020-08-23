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
 * along with this program. If not, see <http:/www.gnu.org/licenses>
 */

import { CommonModule } from '@angular/common';
import {
  ModuleWithProviders,
  NgModule,
  Optional,
  SkipSelf
} from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { ComicsModule } from 'app/comics/comics.module';
import { DuplicatePagesAdaptors } from 'app/library/adaptors/duplicate-pages.adaptor';
import { ComicGridItemComponent } from 'app/library/components/comic-grid-item/comic-grid-item.component';
import { ComicListItemComponent } from 'app/library/components/comic-list-item/comic-list-item.component';
import { ComicListComponent } from 'app/library/components/comic-list/comic-list.component';
import { ScrapingComicListComponent } from 'app/library/components/scraping-comic-list/scraping-comic-list.component';
import { DuplicatePagesEffects } from 'app/library/effects/duplicate-pages.effects';
import { LibraryRoutingModule } from 'app/library/library-routing.module';
import { LibraryPageComponent } from 'app/library/pages/library-page/library-page.component';
import { MissingComicsPageComponent } from 'app/library/pages/missing-comics-page/missing-comics-page.component';
import { MultiComicScrapingPageComponent } from 'app/library/pages/multi-comic-scraping-page/multi-comic-scraping-page.component';
import { MissingComicsPipe } from 'app/library/pipes/missing-comics.pipe';
import { DuplicatePagesService } from 'app/library/services/duplicate-pages.service';
import { CheckboxModule } from 'primeng/checkbox';
import { ContextMenuModule } from 'primeng/contextmenu';
import {
  ButtonModule,
  DialogModule,
  InputTextModule,
  ListboxModule,
  ProgressSpinnerModule,
  ScrollPanelModule,
  SidebarModule,
  SliderModule,
  ToolbarModule,
  TooltipModule,
  TreeModule
} from 'primeng/primeng';
import { LibraryAdaptor } from './adaptors/library.adaptor';
import { ReadingListAdaptor } from './adaptors/reading-list.adaptor';
import { SelectionAdaptor } from './adaptors/selection.adaptor';
import { ComicListToolbarComponent } from './components/comic-list-toolbar/comic-list-toolbar.component';
import { DuplicatePageGridItemComponent } from './components/duplicate-page-grid-item/duplicate-page-grid-item.component';
import { DuplicatePageListItemComponent } from './components/duplicate-page-list-item/duplicate-page-list-item.component';
import { DuplicatesPageToolbarComponent } from './components/duplicates-page-toolbar/duplicates-page-toolbar.component';
import { LibraryEffects } from './effects/library.effects';
import { ReadingListEffects } from './effects/reading-list.effects';
import { DuplicatesPageComponent } from './pages/duplicates-page/duplicates-page.component';
import * as fromDupes from './reducers/duplicate-pages.reducer';
import * as fromLibrary from './reducers/library.reducer';
import * as fromReadingList from './reducers/reading-list.reducer';
import * as fromSelection from './reducers/selection.reducer';
import { LibraryService } from './services/library.service';
import { ReadingListService } from './services/reading-list.service';
import { UserExperienceModule } from 'app/user-experience/user-experience.module';
import { ConvertComicsSettingsComponent } from './components/convert-comics-settings/convert-comics-settings.component';
import * as fromPublisher from 'app/library/reducers/publisher.reducer';
import { PublisherEffects } from 'app/library/effects/publisher.effects';
import { PublisherAdaptor } from 'app/library/adaptors/publisher.adaptor';
import { ConsolidateLibraryComponent } from './components/consolidate-library/consolidate-library.component';
import { LibraryAdminPageComponent } from 'app/library/pages/library-admin-page/library-admin-page.component';
import { FileSaverModule } from 'ngx-filesaver';
import { LibraryNavigationTreeComponent } from './components/library-navigation-tree/library-navigation-tree.component';
import { DuplicateComicsPageComponent } from './pages/duplicate-comics-page/duplicate-comics-page.component';
import { ReadingListEditComponent } from './components/reading-list-edit/reading-list-edit.component';
import { AddComicsToReadingListComponent } from './components/add-comics-to-list-reading-list/add-comics-to-reading-list.component';
import { PluginEffects } from './effects/plugin.effects';
import { PluginAdaptor } from 'app/library/adaptors/plugin.adaptor';
import * as fromPlugin from 'app/library/reducers/plugin.reducer';
import { PluginsPageComponent } from './pages/plugins-page/plugins-page.component';
import * as fromMoveComics from 'app/library/reducers/move-comics.reducer';
import { MOVE_COMICS_FEATURE_KEY } from 'app/library/reducers/move-comics.reducer';
import { MoveComicsEffects } from 'app/library/effects/move-comics.effects';

@NgModule({
  imports: [
    CommonModule,
    LibraryRoutingModule,
    ComicsModule,
    UserExperienceModule,
    TranslateModule.forRoot(),
    StoreModule.forFeature(MOVE_COMICS_FEATURE_KEY, fromMoveComics.reducer),
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
      fromDupes.DUPLICATE_PAGES_FEATURE_KEY,
      fromDupes.reducer
    ),
    StoreModule.forFeature(
      fromPublisher.PUBLISHER_FEATURE_KEY,
      fromPublisher.reducer
    ),
    StoreModule.forFeature(fromPlugin.PLUGIN_FEATURE_KEY, fromPlugin.reducer),
    EffectsModule.forFeature([
      MoveComicsEffects,
      LibraryEffects,
      ReadingListEffects,
      DuplicatePagesEffects,
      PublisherEffects,
      PluginEffects
    ]),
    ContextMenuModule,
    CheckboxModule,
    SliderModule,
    ScrollPanelModule,
    ToolbarModule,
    ProgressSpinnerModule,
    TooltipModule,
    DialogModule,
    SidebarModule,
    ButtonModule,
    FileSaverModule,
    TreeModule,
    ScrollPanelModule,
    InputTextModule,
    ListboxModule
  ],
  exports: [CommonModule, ComicsModule, ComicListComponent],
  declarations: [
    LibraryPageComponent,
    ComicGridItemComponent,
    ComicListItemComponent,
    ComicListComponent,
    ComicListToolbarComponent,
    MissingComicsPageComponent,
    MultiComicScrapingPageComponent,
    ScrapingComicListComponent,
    MissingComicsPipe,
    DuplicatesPageComponent,
    DuplicatePageGridItemComponent,
    DuplicatesPageToolbarComponent,
    DuplicatePageListItemComponent,
    ConvertComicsSettingsComponent,
    ConsolidateLibraryComponent,
    LibraryAdminPageComponent,
    LibraryNavigationTreeComponent,
    DuplicateComicsPageComponent,
    ReadingListEditComponent,
    AddComicsToReadingListComponent,
    PluginsPageComponent
  ],
  providers: [
    LibraryService,
    LibraryAdaptor,
    SelectionAdaptor,
    DuplicatePagesAdaptors,
    ReadingListService,
    ReadingListAdaptor,
    DuplicatePagesService,
    PublisherAdaptor,
    PluginAdaptor
  ]
})
export class LibraryModule {
  constructor(@Optional() @SkipSelf() parentModule?: LibraryModule) {
    if (parentModule) {
      throw new Error(
        'LibraryModule is already loaded. Import it in the AppModule only'
      );
    }
  }

  static forRoot(): ModuleWithProviders {
    return {
      ngModule: LibraryModule
    };
  }
}
