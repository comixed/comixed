/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { StoreModule } from '@ngrx/store';
import { TabViewModule } from 'primeng/tabview';
import { TableModule } from 'primeng/table';
import { AccountPreferencesComponent } from 'app/user/components/account-preferences/account-preferences.component';
import { UserDetailsComponent } from 'app/user/components/user-details/user-details.component';
import { USER_READER } from 'app/user/models/user.fixtures';
import { AccountPageComponent } from './account-page.component';
import { AuthenticationAdaptor, TokenService } from 'app/user';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MessageService } from 'primeng/api';
import { ComicService } from 'app/services/comic.service';
import { UserService } from 'app/services/user.service';
import { EffectsModule } from '@ngrx/effects';
import { BreadcrumbAdaptor } from 'app/adaptors/breadcrumb.adaptor';
import {
  authenticationFeatureKey,
  reducer
} from 'app/user/reducers/authentication.reducer';
import { AuthenticationEffects } from 'app/user/effects/authentication.effects';

describe('AccountPageComponent', () => {
  let component: AccountPageComponent;
  let fixture: ComponentFixture<AccountPageComponent>;
  let auth_adaptor: AuthenticationAdaptor;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        TranslateModule.forRoot(),
        StoreModule.forRoot({}),
        StoreModule.forFeature(authenticationFeatureKey, reducer),
        EffectsModule.forRoot([]),
        EffectsModule.forFeature([AuthenticationEffects]),
        TabViewModule,
        TableModule
      ],
      declarations: [
        AccountPageComponent,
        AccountPreferencesComponent,
        UserDetailsComponent
      ],
      providers: [
        AuthenticationAdaptor,
        BreadcrumbAdaptor,
        MessageService,
        ComicService,
        UserService,
        TokenService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AccountPageComponent);
    component = fixture.componentInstance;
    auth_adaptor = TestBed.get(AuthenticationAdaptor);
    component.user = USER_READER;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
