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

import { enableProdMode, importProvidersFrom } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { environment } from './environments/environment';
import { HTTP_INTERCEPTORS, HttpBackend } from '@angular/common/http';
import { HttpInterceptor } from '@app/interceptors/http.interceptor';
import { AdminModule } from '@app/admin/admin.module';
import { MessagingModule } from '@app/messaging/messaging.module';
import { UserModule } from '@app/user/user.module';
import { ComicBooksModule } from '@app/comic-books/comic-books.module';
import { ComicFileModule } from '@app/comic-files/comic-file.module';
import { LibraryModule } from '@app/library/library.module';
import { ComicPagesModule } from '@app/comic-pages/comic-pages.module';
import { CollectionsModule } from '@app/collections/collections.module';
import { ListsModule } from '@app/lists/lists.module';
import { ComicMetadataModule } from '@app/comic-metadata/comic-metadata.module';
import { LibraryPluginsModule } from '@app/library-plugins/library-plugins.module';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { AppRouting } from './app/app.routing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { StoreModule } from '@ngrx/store';
import { APP_REDUCERS } from '@app/app.reducers';
import { EffectsModule } from '@ngrx/effects';
import { AppEffects } from './app/app.effects';
import { ReleaseEffects } from '@app/effects/release.effects';
import { ImportCountEffects } from '@app/effects/import-count.effects';
import { ComicsReadStatisticsEffects } from '@app/effects/comics-read-statistics.effects';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { LoggerModule } from '@angular-ru/cdk/logger';
import {
  TranslateModule,
  TranslateLoader,
  TranslateCompiler
} from '@ngx-translate/core';
import { HttpLoaderFactory } from '@app/app.translate';
import { TranslateMessageFormatCompiler } from 'ngx-translate-messageformat-compiler';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { FlexLayoutModule } from '@angular-ru/cdk/flex-layout';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { GravatarModule } from 'ngx-gravatar';
import { BarChartModule, NgxChartsModule } from '@swimlane/ngx-charts';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDialogModule } from '@angular/material/dialog';
import { AppComponent } from './app/app.component';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      AdminModule,
      MessagingModule,
      UserModule,
      ComicBooksModule.forRoot(),
      ComicFileModule,
      LibraryModule,
      ComicPagesModule,
      CollectionsModule,
      ListsModule,
      ComicMetadataModule,
      LibraryPluginsModule,
      BrowserModule,
      AppRouting,
      MatToolbarModule,
      MatIconModule,
      StoreModule.forRoot(APP_REDUCERS, {}),
      EffectsModule.forRoot([
        AppEffects,
        ReleaseEffects,
        ImportCountEffects,
        ComicsReadStatisticsEffects
      ]),
      StoreRouterConnectingModule.forRoot(),
      LoggerModule.forRoot({ useLevelGroup: true }),
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpBackend]
        },
        compiler: {
          provide: TranslateCompiler,
          useClass: TranslateMessageFormatCompiler
        },
        defaultLanguage: 'en'
      }),
      StoreDevtoolsModule.instrument({
        maxAge: 25,
        trace: true,
        logOnly: environment.production,
        connectInZone: true
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
      GravatarModule,
      BarChartModule,
      NgxChartsModule,
      MatProgressBarModule,
      MatGridListModule,
      MatDialogModule
    ),
    [{ provide: HTTP_INTERCEPTORS, useClass: HttpInterceptor, multi: true }],
    provideAnimations()
  ]
}).catch(err => console.error(err));
