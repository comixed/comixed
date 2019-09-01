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
import { environment } from '../../environments/environment';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { AdminGuard } from 'app/user/guards/admin.guard';
import { ReaderGuard } from 'app/user/guards/reader.guard';
import { UserRoutingModule } from 'app/user/user-routing.module';
import { AccountPageComponent } from 'app/user/pages/account-page/account-page.component';
import { TranslateModule } from '@ngx-translate/core';
import { UserDetailsComponent } from 'app/user/components/user-details/user-details.component';
import {
  ButtonModule,
  PanelModule,
  TabViewModule,
  ToggleButtonModule,
  TooltipModule
} from 'primeng/primeng';
import { AccountPreferencesComponent } from 'app/user/components/account-preferences/account-preferences.component';
import { TableModule } from 'primeng/table';
import { UsersPageComponent } from 'app/user/pages/users-page/users-page.component';
import { UserDetailsEditorComponent } from 'app/user/components/user-details-editor/user-details-editor.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    UserRoutingModule,
    TranslateModule.forRoot(),
    EffectsModule.forFeature([AuthenticationEffects]),
    StoreDevtoolsModule.instrument({
      name: 'NgRx Testing Store DevTools',
      logOnly: environment.production
    }),
    StoreModule.forFeature(
      fromAuthentication.AUTHENTICATION_FEATURE_KEY,
      fromAuthentication.reducer
    ),
    TabViewModule,
    TableModule,
    PanelModule,
    ButtonModule,
    TooltipModule,
    ToggleButtonModule
  ],
  providers: [AuthenticationAdaptor, TokenService, ReaderGuard, AdminGuard],
  declarations: [
    AccountPageComponent,
    UsersPageComponent,
    UserDetailsComponent,
    UserDetailsEditorComponent,
    AccountPreferencesComponent
  ],
  exports: [
    CommonModule,
    FormsModule,
    TabViewModule,
    TableModule,
    PanelModule,
    ButtonModule,
    TooltipModule,
    ToggleButtonModule
  ]
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
