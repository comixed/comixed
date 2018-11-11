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
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoadingModule, ANIMATION_TYPES } from 'ngx-loading';
import { XhrInterceptor } from './xhr.interceptor';
import { ComicService } from './services/comic.service';
import { MessageService } from 'primeng/api';
import { ImportComicListComponent } from './comic/import-comic-list/import-comic-list.component';
import { ComicDetailsComponent } from './comic/details/comic-details.component';
import { DuplicatePageListComponent } from './comic/duplicate-page-list/duplicate-page-list.component';
import { DuplicatePageListEntryComponent } from './comic/duplicate-page-list-entry/duplicate-page-list-entry.component';
import { PageThumbnailComponent } from './comic/page-thumbnail/page-thumbnail.component';
import { ReadViewerComponent } from './comic/read-viewer/read-viewer.component';
import { SeriesFilterPipe } from './comic/series-filter.pipe';
import { PageDetailsComponent } from './comic/page-details/page-details.component';
import { ImportComicListEntryComponent } from './comic/import-comic-list-entry/import-comic-list-entry.component';
import { SelectedForImportPipe } from './comic/import-comic-list/selected-for-import.pipe';
import { PageSizeComponent } from './comic/page-size/page-size.component';
import { GroupComicsComponent } from './comic/group-comics/group-comics.component';
import { GroupByPipe } from './comic/group-by.pipe';
import { ComicDetailsEditorComponent } from './ui/components/comics/comic-details-editor/comic-details-editor.component';
import { IssueDetailsComponent } from './comic/issue/details/issue-details/issue-details.component';
import { ComicOverviewComponent } from './ui/components/comics/comic-overview/comic-overview.component';
import { ComicStoryComponent } from './ui/components/comics/comic-story/comic-story.component';
import { ComicCreditsComponent } from './ui/components/comic-credits/comic-credits.component';
import { ComicPagesComponent } from './comic/details/pages/comic-pages/comic-pages.component';
import { ComicCoverComponent } from './ui/components/comic-cover/comic-cover.component';
import { MainPageComponent } from './main-page/main-page.component';
import { LoginComponent } from './login/login.component';
import { AccountComponent } from './account/account.component';
import { AlertService } from './services/alert.service';
import { UserService } from './services/user.service';
import { BusyIndicatorComponent } from './busy-indicator/busy-indicator.component';
import { MenubarComponent } from './ui/components/menubar/menubar.component';
import { ImportSidebarComponent } from './ui/components/import/import-sidebar/import-sidebar.component';
import { LibraryPageComponent } from './ui/pages/library/library-page/library-page.component';
import { NotificationsComponent } from './ui/components/notifications/notifications.component';

@NgModule({
  declarations: [
    AppComponent,
    MainPageComponent,
    LoginComponent,
    AccountComponent,
    BusyIndicatorComponent,
    MenubarComponent,
    ImportComicListComponent,
    ComicDetailsComponent,
    DuplicatePageListComponent,
    DuplicatePageListEntryComponent,
    PageThumbnailComponent,
    ReadViewerComponent,
    SeriesFilterPipe,
    PageDetailsComponent,
    ImportComicListEntryComponent,
    SelectedForImportPipe,
    PageSizeComponent,
    GroupComicsComponent,
    GroupByPipe,
    ComicDetailsEditorComponent,
    IssueDetailsComponent,
    ComicOverviewComponent,
    ComicStoryComponent,
    ComicCreditsComponent,
    ComicPagesComponent,
    ComicCoverComponent,
    ImportSidebarComponent,
    LibraryPageComponent,
    NotificationsComponent,
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
