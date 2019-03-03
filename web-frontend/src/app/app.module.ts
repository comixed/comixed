/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project
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

import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NgxPaginationModule } from "ngx-pagination";
import { MenubarModule } from "primeng/menubar";
import { SidebarModule } from "primeng/sidebar";
import { InputTextModule } from "primeng/inputtext";
import { ButtonModule } from "primeng/button";
import { CheckboxModule } from "primeng/checkbox";
import { DropdownModule } from "primeng/dropdown";
import { SliderModule } from "primeng/slider";
import { TabViewModule } from "primeng/tabview";
import { TableModule } from "primeng/table";
import { ToastModule } from "primeng/toast";
import { CardModule } from "primeng/card";
import { DataViewModule } from "primeng/dataview";
import { DialogModule } from "primeng/dialog";
import { ScrollPanelModule } from "primeng/scrollpanel";
import { ToggleButtonModule } from "primeng/togglebutton";
import { PanelModule } from "primeng/panel";
import { TooltipModule } from "primeng/tooltip";
import { ToolbarModule } from "primeng/toolbar";
import { SplitButtonModule } from "primeng/splitbutton";
import { ProgressBarModule } from "primeng/progressbar";
import { BlockUIModule } from "primeng/blockui";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { ConfirmationService } from "primeng/api";
import { PasswordModule } from "primeng/password";
import { PickListModule } from "primeng/picklist";
import { InplaceModule } from "primeng/inplace";
import { OverlayPanelModule } from "primeng/overlaypanel";
import { AppRouting } from "./app.routing";
import { AppComponent } from "./app.component";
import {
  HttpClient,
  HttpClientModule,
  HTTP_INTERCEPTORS
} from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { LoadingModule, ANIMATION_TYPES } from "ngx-loading";
import { XhrInterceptor } from "./xhr.interceptor";
import { ComicService } from "./services/comic.service";
import { MessageService } from "primeng/api";
import { ComicDetailsComponent } from "./ui/pages/comic/comic-details/comic-details.component";
import { ComicReaderComponent } from "./ui/components/comic/comic-reader/comic-reader.component";
import { ComicDetailsEditorComponent } from "./ui/components/comic/comic-details-editor/comic-details-editor.component";
import { ComicOverviewComponent } from "./ui/components/comic/comic-overview/comic-overview.component";
import { ComicStoryComponent } from "./ui/components/comic/comic-story/comic-story.component";
import { ComicCreditsComponent } from "./ui/components/comic/comic-credits/comic-credits.component";
import { ComicPagesComponent } from "./ui/components/comic/comic-pages/comic-pages.component";
import { MainPageComponent } from "./ui/pages/main-page/main-page.component";
import { LoginComponent } from "./ui/components/login/login.component";
import { UserService } from "./services/user.service";
import { LibraryPageComponent } from "./ui/pages/library/library-page/library-page.component";
import { ImportPageComponent } from "./ui/pages/library/import-page/import-page.component";
import { DuplicatesPageComponent } from "./ui/pages/library/duplicates-page/duplicates-page.component";
import { ImportToolbarComponent } from "./ui/components/import/import-toolbar/import-toolbar.component";
import { SelectedComicsComponent } from "./ui/components/import/selected-comics/selected-comics.component";
import { FileDetailsCoverComponent } from "./ui/components/file-details/file-details-cover/file-details-cover.component";
import { StoreModule } from "@ngrx/store";
import { userReducer } from "./reducers/user.reducer";
import { userAdminReducer } from "./reducers/user-admin.reducer";
import { importingReducer } from "./reducers/importing.reducer";
import { libraryReducer } from "./reducers/library.reducer";
import { libraryFilterReducer } from "./reducers/library-filter.reducer";
import { libraryDisplayReducer } from "./reducers/library-display.reducer";
import { singleComicScrapingReducer } from "./reducers/single-comic-scraping.reducer";
import { multipleComicsScrapingReducer } from "./reducers/multiple-comics-scraping.reducer";
import { duplicatesReducer } from "./reducers/duplicates.reducer";
import { IssueDetailsComponent } from "./ui/components/library/issue-details/issue-details.component";
import { EffectsModule } from "@ngrx/effects";
import { UserEffects } from "./effects/user.effects";
import { UserAdminEffects } from "./effects/user-admin.effects";
import { ImportingEffects } from "./effects/importing.effects";
import { LibraryEffects } from "./effects/library.effects";
import { SingleComicScrapingEffects } from "./effects/single-comic-scraping.effects";
import { DuplicatesEffects } from "./effects/duplicates.effects";
import { DuplicatePagesViewComponent } from "./ui/views/library/duplicate-pages-view/duplicate-pages-view.component";
import { PageHashViewComponent } from "./ui/views/library/page-hash-view/page-hash-view.component";
import { VolumeListComponent } from "./ui/components/scraping/volume-list/volume-list.component";
import { TokenStorage } from "./storage/token.storage";
import { AccountPageComponent } from "./ui/pages/account/account-page/account-page.component";
import { AccountPreferencesComponent } from "./ui/components/account/account-preferences/account-preferences.component";
import { UserDetailsComponent } from "./ui/components/account/user-details/user-details.component";
import { MultipleComicScrapingComponent } from "./ui/components/scraping/multiple-comic-scraping/multiple-comic-scraping.component";
import { LibraryScrapingToolbarComponent } from "./ui/components/library/library-scraping-toolbar/library-scraping-toolbar.component";
import { ScrapingComicListComponent } from "./ui/components/scraping/scraping-comic-list/scraping-comic-list.component";
import { AdminGuard } from "./admin.guard";
import { ReaderGuard } from "./reader.guard";
import { ComicTitlePipe } from "./pipes/comic-title.pipe";
import { ComicCoverUrlPipe } from "./pipes/comic-cover-url.pipe";
import { ComicPageUrlPipe } from "./pipes/comic-page-url.pipe";
import { ComicFileCoverUrlPipe } from "./pipes/comic-file-cover-url.pipe";
import { LibraryFilterComponent } from "./ui/components/library/library-filter/library-filter.component";
import { LibraryFilterPipe } from "./pipes/library-filter.pipe";
import { UsersPageComponent } from "./ui/pages/admin/users-page/users-page.component";
import { UserDetailsEditorComponent } from "./ui/components/admin/user-details-editor/user-details-editor.component";
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { MenubarComponent } from "./ui/components/main/menubar/menubar.component";
import { ComicListItemComponent } from "./ui/components/library/comic-list-item/comic-list-item.component";
import { ComicGridItemComponent } from "./ui/components/library/comic-grid-item/comic-grid-item.component";
import { SeriesPageComponent } from "./ui/pages/series/series-page/series-page.component";
import { SeriesDetailsPageComponent } from "./ui/pages/series/series-details-page/series-details-page.component";
import { ComicSeriesPipe } from "./pipes/comic-series.pipe";
import { ComicListToolbarComponent } from "./ui/components/library/comic-list-toolbar/comic-list-toolbar.component";
import { PublishersPageComponent } from "./ui/pages/publishers/publishers-page/publishers-page.component";
import { PublisherDetailsPageComponent } from "./ui/pages/publishers/publisher-details-page/publisher-details-page.component";
import { ComicPublisherPipe } from "./pipes/comic-publisher.pipe";
import { ComicCoverComponent } from "./ui/components/comic/comic-cover/comic-cover.component";
import { CharactersPageComponent } from "./ui/pages/characters/characters-page/characters-page.component";
import { CharacterDetailsPageComponent } from "./ui/pages/characters/character-details-page/character-details-page.component";
import { ComicCharacterPipe } from "./pipes/comic-character.pipe";
import { TeamsPageComponent } from "./ui/pages/teams/teams-page/teams-page.component";
import { TeamDetailsPageComponent } from "./ui/pages/teams/team-details-page/team-details-page.component";
import { ComicTeamPipe } from "./pipes/comic-team.pipe";
import { LocationsPageComponent } from "./ui/pages/locations/locations-page/locations-page.component";
import { LocationDetailsPageComponent } from "./ui/pages/locations/location-details-page/location-details-page.component";
import { ComicLocationPipe } from "./pipes/comic-location.pipe";
import { ComicGroupingCardComponent } from "./ui/components/comic/comic-grouping-card/comic-grouping-card.component";
import { StoryArcsPageComponent } from "./ui/pages/story-arcs/story-arcs-page/story-arcs-page.component";
import { ComicStoriesPipe } from "./pipes/comic-stories.pipe";
import { StoryArcDetailsPageComponent } from "./ui/pages/story-arcs/story-arc-details-page/story-arc-details-page.component";
import { ComicListComponent } from "./ui/components/library/comic-list/comic-list.component";
import { SelectedComicsListComponent } from "./ui/components/library/selected-comics-list/selected-comics-list.component";
import { MultiComicScrapingPageComponent } from "./ui/pages/library/multi-comic-scraping-page/multi-comic-scraping-page.component";

@NgModule({
  declarations: [
    AppComponent,
    MainPageComponent,
    LoginComponent,
    ComicDetailsComponent,
    ComicReaderComponent,
    ComicDetailsEditorComponent,
    ComicOverviewComponent,
    ComicStoryComponent,
    ComicCreditsComponent,
    ComicPagesComponent,
    LibraryPageComponent,
    ImportPageComponent,
    DuplicatesPageComponent,
    ImportToolbarComponent,
    SelectedComicsComponent,
    FileDetailsCoverComponent,
    IssueDetailsComponent,
    DuplicatePagesViewComponent,
    PageHashViewComponent,
    VolumeListComponent,
    AccountPageComponent,
    AccountPreferencesComponent,
    UserDetailsComponent,
    MultipleComicScrapingComponent,
    LibraryScrapingToolbarComponent,
    ScrapingComicListComponent,
    ComicTitlePipe,
    ComicCoverUrlPipe,
    ComicPageUrlPipe,
    ComicFileCoverUrlPipe,
    LibraryFilterComponent,
    LibraryFilterPipe,
    UsersPageComponent,
    UserDetailsEditorComponent,
    MenubarComponent,
    ComicListItemComponent,
    ComicGridItemComponent,
    SeriesPageComponent,
    SeriesDetailsPageComponent,
    ComicSeriesPipe,
    ComicListToolbarComponent,
    PublishersPageComponent,
    PublisherDetailsPageComponent,
    ComicPublisherPipe,
    ComicCoverComponent,
    CharactersPageComponent,
    CharacterDetailsPageComponent,
    ComicCharacterPipe,
    TeamsPageComponent,
    TeamDetailsPageComponent,
    ComicTeamPipe,
    LocationsPageComponent,
    LocationDetailsPageComponent,
    ComicLocationPipe,
    ComicGroupingCardComponent,
    StoryArcsPageComponent,
    ComicStoriesPipe,
    StoryArcDetailsPageComponent,
    ComicListComponent,
    SelectedComicsListComponent,
    MultiComicScrapingPageComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRouting,
    HttpClientModule,
    MenubarModule,
    SidebarModule,
    InputTextModule,
    ButtonModule,
    CheckboxModule,
    DropdownModule,
    SliderModule,
    TabViewModule,
    TableModule,
    ToastModule,
    CardModule,
    DataViewModule,
    DialogModule,
    ScrollPanelModule,
    ToggleButtonModule,
    PanelModule,
    TooltipModule,
    ToolbarModule,
    SplitButtonModule,
    ProgressBarModule,
    BlockUIModule,
    ConfirmDialogModule,
    PasswordModule,
    InplaceModule,
    OverlayPanelModule,
    PickListModule,
    LoadingModule.forRoot({
      animationType: ANIMATION_TYPES.pulse,
      fullScreenBackdrop: true
    }),
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    LoadingModule.forRoot({
      animationType: ANIMATION_TYPES.pulse,
      fullScreenBackdrop: true
    }),

    StoreModule.forRoot({
      user: userReducer,
      importing: importingReducer,
      library: libraryReducer,
      library_filter: libraryFilterReducer,
      library_display: libraryDisplayReducer,
      single_comic_scraping: singleComicScrapingReducer,
      multiple_comic_scraping: multipleComicsScrapingReducer,
      duplicates: duplicatesReducer,
      user_admin: userAdminReducer
    }),
    EffectsModule.forRoot([
      UserEffects,
      ImportingEffects,
      LibraryEffects,
      SingleComicScrapingEffects,
      DuplicatesEffects,
      UserAdminEffects
    ]),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [
    UserService,
    ComicService,
    MessageService,
    [{ provide: HTTP_INTERCEPTORS, useClass: XhrInterceptor, multi: true }],
    ConfirmationService,
    TokenStorage,
    AdminGuard,
    ReaderGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}
