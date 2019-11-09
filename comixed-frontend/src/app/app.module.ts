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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { PanelModule } from 'primeng/panel';
import { TooltipModule } from 'primeng/tooltip';
import { ToolbarModule } from 'primeng/toolbar';
import { SplitButtonModule } from 'primeng/splitbutton';
import { ProgressBarModule } from 'primeng/progressbar';
import { BlockUIModule } from 'primeng/blockui';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PasswordModule } from 'primeng/password';
import { PickListModule } from 'primeng/picklist';
import { InplaceModule } from 'primeng/inplace';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ChartModule } from 'primeng/chart';
import { AppRouting } from 'app/app.routing';
import { AppComponent } from 'app/app.component';
import {
  HTTP_INTERCEPTORS,
  HttpClient,
  HttpClientModule
} from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { XhrInterceptor } from 'app/xhr.interceptor';
import { ComicService } from 'app/services/comic.service';
import { MainPageComponent } from 'app/ui/pages/main-page/main-page.component';
import { LoginComponent } from 'app/ui/components/login/login.component';
import { UserService } from 'app/services/user.service';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import {
  TranslateCompiler,
  TranslateLoader,
  TranslateModule
} from '@ngx-translate/core';
import { FileSaverModule } from 'ngx-filesaver';
import { LibraryAdminPageComponent } from 'app/ui/pages/admin/library-admin-page/library-admin-page.component';
import { ReadingListPageComponent } from './ui/pages/reading-lists/reading-list-page/reading-list-page.component';
import { ReadingListsPageComponent } from './ui/pages/reading-lists/reading-lists-page/reading-lists-page.component';
import { REDUCERS } from 'app/app.reducers';
import {
  BreadcrumbModule,
  ContextMenuModule,
  TieredMenuModule
} from 'primeng/primeng';
import { UserModule } from 'app/user/user.module';
import { EFFECTS } from 'app/app.effects';
import { LibraryModule } from 'app/library/library.module';
import { TranslateMessageFormatCompiler } from 'ngx-translate-messageformat-compiler';
import { MultiTranslateHttpLoader } from 'ngx-translate-multi-http-loader';
import { BackendStatusModule } from 'app/backend-status/backend-status.module';
import { ComicsModule } from 'app/comics/comics.module';
import { MainMenuComponent } from 'app/components/main-menu/main-menu.component';
import { BreadcrumbAdaptor } from 'app/adaptors/breadcrumb.adaptor';
import { ComicImportModule } from 'app/comic-import/comic-import.module';

@NgModule({
  declarations: [
    AppComponent,
    MainPageComponent,
    LoginComponent,
    LibraryAdminPageComponent,
    ReadingListPageComponent,
    ReadingListsPageComponent,
    MainMenuComponent
  ],
  imports: [
    UserModule,
    ComicsModule,
    LibraryModule,
    ComicImportModule,
    BackendStatusModule,
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
    ChartModule,
    PickListModule,
    ContextMenuModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TieredMenuModule,

    StoreModule.forRoot(REDUCERS),
    EffectsModule.forRoot(EFFECTS),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      },
      compiler: {
        provide: TranslateCompiler,
        useClass: TranslateMessageFormatCompiler
      }
    }),
    FileSaverModule,
    BreadcrumbModule
  ],
  providers: [
    BreadcrumbAdaptor,
    UserService,
    ComicService,
    MessageService,
    [{ provide: HTTP_INTERCEPTORS, useClass: XhrInterceptor, multi: true }],
    ConfirmationService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

export function HttpLoaderFactory(http: HttpClient) {
  return new MultiTranslateHttpLoader(http, [
    { prefix: './assets/i18n/common-', suffix: '.json' },
    { prefix: './assets/i18n/app-', suffix: '.json' },
    { prefix: './assets/i18n/comics-', suffix: '.json' },
    { prefix: './assets/i18n/library-', suffix: '.json' },
    { prefix: './assets/i18n/comic-import-', suffix: '.json' },
    { prefix: './assets/i18n/backend-status-', suffix: '.json' },
    { prefix: './assets/i18n/user-', suffix: '.json' }
  ]);
}
