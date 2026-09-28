/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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

import {
  ApplicationConfig,
  importProvidersFrom,
  provideBrowserGlobalErrorListeners
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from '@app/app-routes';
import { environment } from '../environments/environment';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  provideTranslateCompiler,
  provideTranslateService
} from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { DashboardModule } from '@app/dashboard/dashboard-module';
import { UserModule } from '@app/account/user-module';
import { authenticationInterceptor } from '@app/account/interceptors/authentication-interceptor';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import {
  MESSAGE_FORMAT_CONFIG,
  TranslateMessageFormatCompiler
} from 'ngx-translate-messageformat-compiler';
import { MessagingModule } from '@app/messaging/messaging-module';
import { LibraryModule } from '@app/library/library-module';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAnimationsAsync(),
    provideLogger({ minLevel: LoggerLevel.TRACE }),
    provideRouter(appRoutes),
    environment.providers,
    provideHttpClient(withInterceptors([authenticationInterceptor])),
    provideTranslateService({
      lang: 'en',
      fallbackLang: 'en',
      compiler: provideTranslateCompiler(TranslateMessageFormatCompiler),
      loader: provideTranslateHttpLoader({
        prefix: '/i18n/',
        suffix: '.json'
      })
    }),
    {
      provide: MESSAGE_FORMAT_CONFIG,
      useValue: {
        throwOnError: true
      }
    },
    importProvidersFrom(
      StoreModule.forRoot({}, {}),
      EffectsModule.forRoot([]),
      StoreDevtoolsModule.instrument({
        maxAge: 25,
        trace: true,
        logOnly: environment.production,
        connectInZone: true
      }),
      UserModule,
      MessagingModule,
      LibraryModule,
      DashboardModule
    )
  ]
};
