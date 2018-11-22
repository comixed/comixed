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

import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { ConfirmationPopoverModule } from 'angular-confirmation-popover';
import { MenubarModule } from 'primeng/menubar';
import { SidebarModule } from 'primeng/sidebar';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { SliderModule } from 'primeng/slider';
import { TabViewModule } from 'primeng/tabview';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { DataViewModule } from 'primeng/dataview';
import { DialogModule } from 'primeng/dialog';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { GalleriaModule } from 'primeng/galleria';
import { PanelModule } from 'primeng/panel';
import { TooltipModule } from 'primeng/tooltip';
import { ToolbarModule } from 'primeng/toolbar';
import { SplitButtonModule } from 'primeng/splitbutton';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoadingModule, ANIMATION_TYPES } from 'ngx-loading';
import { XhrInterceptor } from './xhr.interceptor';
import { ComicService } from './services/comic.service';
import { MessageService } from 'primeng/api';
import { ComicDetailsComponent } from './ui/pages/comic/comic-details/comic-details.component';
import { ComicReaderComponent } from './ui/components/comics/comic-reader/comic-reader.component';
import { ComicDetailsEditorComponent } from './ui/components/comics/comic-details-editor/comic-details-editor.component';
import { ComicOverviewComponent } from './ui/components/comics/comic-overview/comic-overview.component';
import { ComicStoryComponent } from './ui/components/comics/comic-story/comic-story.component';
import { ComicCreditsComponent } from './ui/components/comics/comic-credits/comic-credits.component';
import { ComicPagesComponent } from './ui/components/comics/comic-pages/comic-pages.component';
import { MainPageComponent } from './ui/pages/main-page/main-page.component';
import { LoginComponent } from './login/login.component';
import { AccountComponent } from './account/account.component';
import { AlertService } from './services/alert.service';
import { UserService } from './services/user.service';
import { MenubarComponent } from './ui/components/menubar/menubar.component';
import { LibraryPageComponent } from './ui/pages/library/library-page/library-page.component';
import { NotificationsComponent } from './ui/components/notifications/notifications.component';
import { ImportPageComponent } from './ui/pages/library/import-page/import-page.component';
import { DuplicatesPageComponent } from './ui/pages/library/duplicates-page/duplicates-page.component';
import { ImportToolbarComponent } from './ui/components/import/import-toolbar/import-toolbar.component';
import { SelectedComicsComponent } from './ui/components/import/selected-comics/selected-comics.component';
import { FileDetailsCoverComponent } from './ui/components/file-details/file-details-cover/file-details-cover.component';
import { StoreModule } from '@ngrx/store';
import { libraryReducer } from './reducers/library.reducer';
import { libraryDisplayReducer } from './reducers/library-display.reducer';
import { LibraryCoversComponent } from './ui/components/library/library-covers/library-covers.component';
import { LibraryDetailsComponent } from './ui/components/library/library-details/library-details.component';
import { IssueDetailsComponent } from './ui/components/library/issue-details/issue-details.component';

@NgModule({
  declarations: [
    AppComponent,
    MainPageComponent,
    LoginComponent,
    AccountComponent,
    MenubarComponent,
    ComicDetailsComponent,
    ComicReaderComponent,
    ComicDetailsEditorComponent,
    ComicOverviewComponent,
    ComicStoryComponent,
    ComicCreditsComponent,
    ComicPagesComponent,
    LibraryPageComponent,
    NotificationsComponent,
    ImportPageComponent,
    DuplicatesPageComponent,
    ImportToolbarComponent,
    SelectedComicsComponent,
    FileDetailsCoverComponent,
    LibraryCoversComponent,
    LibraryDetailsComponent,
    IssueDetailsComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
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
    GalleriaModule,
    PanelModule,
    TooltipModule,
    ToolbarModule,
    SplitButtonModule,
    LoadingModule.forRoot({
      animationType: ANIMATION_TYPES.pulse,
      fullScreenBackdrop: true,
    }),
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ConfirmationPopoverModule.forRoot({
      confirmButtonType: 'danger',
      cancelButtonType: 'basic',
    }),
    NgxPaginationModule,

    FormsModule,
    ReactiveFormsModule,
    LoadingModule.forRoot({
      animationType: ANIMATION_TYPES.pulse,
      fullScreenBackdrop: true,
    }),

    StoreModule.forRoot({
      library: libraryReducer,
      library_display: libraryDisplayReducer,
    }),
  ],
  providers: [
    AlertService,
    UserService,
    ComicService,
    MessageService,
    [
      { provide: HTTP_INTERCEPTORS, useClass: XhrInterceptor, multi: true }
    ],
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
