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
import { HTTP_INTERCEPTORS, HttpBackend } from '@angular/common/http';
import { HttpInterceptor } from '@app/interceptors/http.interceptor';
import { HomePageComponent } from '@app/pages/home-page/home-page.component';
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
import { LoggerModule } from '@angular-ru/cdk/logger';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LibraryModule } from '@app/library/library.module';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { APP_REDUCERS } from '@app/app.reducers';
import { environment } from '../environments/environment';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { ReleaseEffects } from '@app/effects/release.effects';
import { BuildDetailsPageComponent } from '@app/pages/build-details-page/build-details-page.component';
import { MatCardModule } from '@angular/material/card';
import { AdminModule } from '@app/admin/admin.module';
import { MatDividerModule } from '@angular/material/divider';
import { MessagingModule } from '@app/messaging/messaging.module';
import { ImportCountEffects } from '@app/effects/import-count.effects';
import { MatSelectModule } from '@angular/material/select';
import { FooterComponent } from './components/footer/footer.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { SideNavigationComponent } from './components/side-navigation/side-navigation.component';
import { MatListModule } from '@angular/material/list';
import { ComicPagesModule } from '@app/comic-pages/comic-pages.module';
import { CollectionsModule } from '@app/collections/collections.module';
import { ComicBooksModule } from '@app/comic-books/comic-books.module';
import { ComicFileModule } from '@app/comic-files/comic-file.module';
import { GravatarModule } from 'ngx-gravatar';
import { ListsModule } from '@app/lists/lists.module';
import { BarChartModule, NgxChartsModule } from '@swimlane/ngx-charts';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ComicMetadataModule } from '@app/comic-metadata/comic-metadata.module';
import { MatGridListModule } from '@angular/material/grid-list';
import { CollectionsChartComponent } from './components/collections-chart/collections-chart.component';
import { ComicStateChartComponent } from './components/comic-state-chart/comic-state-chart.component';
import { ComicsByYearChartComponent } from './components/comics-by-year-chart/comics-by-year-chart.component';
import { ComicsReadChartComponent } from '@app/components/comics-read-chart/comics-read-chart.component';
import { MatDialogModule } from '@angular/material/dialog';
import { FlexLayoutModule } from '@angular-ru/cdk/flex-layout';
import { ComicsReadStatisticsEffects } from '@app/effects/comics-read-statistics.effects';
import { LibraryPluginsModule } from '@app/library-plugins/library-plugins.module';

@NgModule({
  declarations: [
    AppComponent,
    HomePageComponent,
    NavigationBarComponent,
    BuildDetailsPageComponent,
    FooterComponent,
    SideNavigationComponent,
    CollectionsChartComponent,
    ComicStateChartComponent,
    ComicsByYearChartComponent,
    ComicsReadChartComponent
  ],
  imports: [
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
    BrowserAnimationsModule,
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
  ],
  providers: [
    [{ provide: HTTP_INTERCEPTORS, useClass: HttpInterceptor, multi: true }]
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
