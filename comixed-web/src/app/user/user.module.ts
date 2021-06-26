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

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import {
  reducer as userReducer,
  USER_FEATURE_KEY
} from './reducers/user.reducer';
import { EffectsModule } from '@ngrx/effects';
import { UserEffects } from './effects/user.effects';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { UserRouting } from './user.routing';
import { HttpClientModule } from '@angular/common/http';
import { CoreModule } from '@app/core/core.module';
import { MatCardModule } from '@angular/material/card';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { UserService } from '@app/user/services/user.service';
import { AccountEditPageComponent } from './pages/account-edit-page/account-edit-page.component';
import { UserPreferencesPageComponent } from './pages/user-preferences-page/user-preferences-page.component';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { GravatarModule } from 'ngx-gravatar';
import { UserCardComponent } from './components/user-card/user-card.component';
import { MatToolbarModule } from '@angular/material/toolbar';

@NgModule({
  declarations: [
    LoginPageComponent,
    AccountEditPageComponent,
    UserPreferencesPageComponent,
    UserCardComponent
  ],
  providers: [UserService],
  imports: [
    CommonModule,
    CoreModule,
    UserRouting,
    HttpClientModule,
    TranslateModule.forRoot(),
    StoreModule.forFeature(USER_FEATURE_KEY, userReducer),
    EffectsModule.forFeature([UserEffects]),
    GravatarModule,
    MatCardModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatSortModule,
    MatTooltipModule,
    MatToolbarModule
  ],
  exports: []
})
export class UserModule {}
