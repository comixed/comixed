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

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRouting } from './app.routing';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { HttpInterceptor } from '@app/interceptors/http.interceptor';
import { HomeComponent } from './pages/home/home.component';
import { NavigationBarComponent } from './components/navigation-bar/navigation-bar.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { AppEffects } from './app.effects';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import {
  TranslateCompiler,
  TranslateLoader,
  TranslateModule
} from '@ngx-translate/core';
import { HttpLoaderFactory } from '@app/app.translate';
import { TranslateMessageFormatCompiler } from 'ngx-translate-messageformat-compiler';
import { UserModule } from '@app/user/user.module';
import { LoggerModule } from '@angular-ru/logger';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LibraryModule } from '@app/library/library.module';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { APP_REDUCERS } from '@app/app.reducers';
import { environment } from '../environments/environment';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { BuildDetailsEffects } from '@app/effects/build-details.effects';
import { BuildDetailsComponent } from './pages/build-details/build-details.component';
import { MatCardModule } from '@angular/material/card';
import { AdminModule } from '@app/admin/admin.module';
import { MatDividerModule } from '@angular/material/divider';
import { MessagingModule } from '@app/messaging/messaging.module';
import { TaskCountService } from '@app/services/task-count.service';
import { ImportCountEffects } from '@app/effects/import-count.effects';
import { MatSelectModule } from '@angular/material/select';
import { FooterComponent } from './components/footer/footer.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatSidenavModule } from '@angular/material/sidenav';
import { SideNavigationComponent } from './components/side-navigation/side-navigation.component';
import { MatListModule } from '@angular/material/list';
import { BlockedPagesModule } from '@app/blocked-pages/blocked-pages.module';
import { CollectionsModule } from '@app/collections/collections.module';
import { LastReadModule } from '@app/last-read/last-read.module';
import { ComicFileModule } from '@app/comic-file/comic-file.module';
import { ComicBookModule } from '@app/comic-book/comic-book.module';
import { GravatarModule } from 'ngx-gravatar';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavigationBarComponent,
    BuildDetailsComponent,
    FooterComponent,
    SideNavigationComponent
  ],
  imports: [
    AdminModule,
    MessagingModule,
    UserModule,
    ComicBookModule.forRoot(),
    ComicFileModule,
    LibraryModule,
    BlockedPagesModule,
    LastReadModule,
    CollectionsModule,
    BrowserModule,
    AppRouting,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatIconModule,
    StoreModule.forRoot(APP_REDUCERS, {}),
    EffectsModule.forRoot([
      AppEffects,
      BuildDetailsEffects,
      ImportCountEffects
    ]),
    StoreRouterConnectingModule.forRoot(),
    LoggerModule.forRoot({ useLevelGroup: true }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      },
      compiler: {
        provide: TranslateCompiler,
        useClass: TranslateMessageFormatCompiler
      },
      defaultLanguage: 'en'
    }),
    StoreDevtoolsModule.instrument({
      maxAge: 25,

      logOnly: environment.production
    }),
    MatButtonModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatCardModule,
    MatDividerModule,
    MatSelectModule,
    FlexLayoutModule,
    MatSidenavModule,
    MatListModule,
    GravatarModule
  ],
  providers: [
    [
      { provide: HTTP_INTERCEPTORS, useClass: HttpInterceptor, multi: true },
      TaskCountService
    ]
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
