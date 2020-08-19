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

import { CommonModule } from '@angular/common';
import {
  HTTP_INTERCEPTORS,
  HttpClient,
  HttpClientModule
} from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import {
  TranslateCompiler,
  TranslateLoader,
  TranslateModule
} from '@ngx-translate/core';
import { BreadcrumbAdaptor } from 'app/adaptors/breadcrumb.adaptor';
import { AppComponent } from 'app/app.component';
import { AppRouting } from 'app/app.routing';
import { BackendStatusModule } from 'app/backend-status/backend-status.module';
import { ComicImportModule } from 'app/comic-import/comic-import.module';
import { ComicsModule } from 'app/comics/comics.module';
import { LoginComponent } from 'app/components/login/login.component';
import { LibraryModule } from 'app/library/library.module';
import { MainPageComponent } from 'app/pages/main-page/main-page.component';
import { UserService } from 'app/services/user.service';
import { UserModule } from 'app/user/user.module';
import { XhrInterceptor } from 'app/xhr.interceptor';
import { TranslateMessageFormatCompiler } from 'ngx-translate-messageformat-compiler';
import { MultiTranslateHttpLoader } from 'ngx-translate-multi-http-loader';
import { ConfirmationService, MessageService } from 'primeng/api';
import { BlockUIModule } from 'primeng/blockui';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DataViewModule } from 'primeng/dataview';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InplaceModule } from 'primeng/inplace';
import { InputTextModule } from 'primeng/inputtext';
import { MenubarModule } from 'primeng/menubar';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { PanelModule } from 'primeng/panel';
import { PasswordModule } from 'primeng/password';
import { PickListModule } from 'primeng/picklist';
import {
  BreadcrumbModule,
  ContextMenuModule,
  MenuModule
} from 'primeng/primeng';
import { ProgressBarModule } from 'primeng/progressbar';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { SidebarModule } from 'primeng/sidebar';
import { SliderModule } from 'primeng/slider';
import { SplitButtonModule } from 'primeng/splitbutton';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { ToastModule } from 'primeng/toast';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { LoggerModule } from '@angular-ru/logger';
import { NavigationBarComponent } from './components/navigation-bar/navigation-bar.component';

@NgModule({
  declarations: [
    AppComponent,
    MainPageComponent,
    LoginComponent,
    NavigationBarComponent
  ],
  imports: [
    UserModule,
    LibraryModule,
    ComicsModule,
    ComicImportModule,
    BackendStatusModule,
    BrowserModule,
    BrowserAnimationsModule,
    AppRouting,
    HttpClientModule,
    StoreModule.forRoot(
      {},
      {
        runtimeChecks: {
          strictStateSerializability: false,
          strictActionSerializability: false,
          strictStateImmutability: false,
          strictActionImmutability: false
        }
      }
    ),
    EffectsModule.forRoot([]),
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
    LoggerModule.forRoot(),
    BreadcrumbModule,
    MenuModule
  ],
  providers: [
    BreadcrumbAdaptor,
    UserService,
    MessageService,
    [{ provide: HTTP_INTERCEPTORS, useClass: XhrInterceptor, multi: true }],
    ConfirmationService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

export function HttpLoaderFactory(http: HttpClient) {
  return new MultiTranslateHttpLoader(http, [
    { prefix: './assets/i18n/', suffix: '/common.json' },
    { prefix: './assets/i18n/', suffix: '/scraping.json' },
    { prefix: './assets/i18n/', suffix: '/app.json' },
    { prefix: './assets/i18n/', suffix: '/comics.json' },
    { prefix: './assets/i18n/', suffix: '/library.json' },
    { prefix: './assets/i18n/', suffix: '/comic-import.json' },
    { prefix: './assets/i18n/', suffix: '/backend-status.json' },
    { prefix: './assets/i18n/', suffix: '/user.json' }
  ]);
}
