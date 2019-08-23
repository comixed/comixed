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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import {
  ModuleWithProviders,
  NgModule,
  Optional,
  SkipSelf
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { EffectsModule } from '@ngrx/effects';
import { AuthenticationAdaptor } from 'app/user';
import { StoreModule } from '@ngrx/store';
import * as fromAuthentication from './reducers/authentication.reducer';
import { AuthenticationEffects } from './effects/authentication.effects';
import { TokenService } from 'app/user/services/token.service';
import { metaReducers, reducers } from 'app/user/index';
import { environment } from '../../environments/environment';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { AdminGuard } from 'app/user/guards/admin.guard';
import { ReaderGuard } from 'app/user/guards/reader.guard';

@NgModule({
  imports: [
    CommonModule,
    EffectsModule.forFeature([AuthenticationEffects]),
    StoreDevtoolsModule.instrument({
      name: 'NgRx Testing Store DevTools',
      logOnly: environment.production
    }),
    StoreModule.forFeature(
      fromAuthentication.AUTHENTICATION_FEATURE_KEY,
      fromAuthentication.reducer
    )
  ],
  providers: [AuthenticationAdaptor, TokenService, ReaderGuard, AdminGuard],
  declarations: [],
  exports: [CommonModule]
})
export class UserModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: UserModule
    };
  }

  constructor(@Optional() @SkipSelf() parentModule?: UserModule) {
    if (parentModule) {
      throw new Error(
        'UserModule is already loaded. Import it in the AppModule only'
      );
    }
  }
}
