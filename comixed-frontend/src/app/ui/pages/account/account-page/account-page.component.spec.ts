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
import { AccountPreferencesComponent } from 'app/ui/components/account/account-preferences/account-preferences.component';
import { UserDetailsComponent } from 'app/ui/components/account/user-details/user-details.component';
import { USER_READER } from 'app/user/models/user.fixtures';
import { AccountPageComponent } from './account-page.component';
import { REDUCERS } from 'app/app.reducers';
import { AuthenticationAdaptor } from 'app/user';
import { UserModule } from 'app/user/user.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MessageService } from 'primeng/api';
import { ComicService } from 'app/services/comic.service';
import { UserService } from 'app/services/user.service';
import { EffectsModule } from '@ngrx/effects';
import { EFFECTS } from 'app/app.effects';

describe('AccountPageComponent', () => {
  let component: AccountPageComponent;
  let fixture: ComponentFixture<AccountPageComponent>;
  let auth_adaptor: AuthenticationAdaptor;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        UserModule,
        HttpClientTestingModule,
        RouterTestingModule,
        TranslateModule.forRoot(),
        TabViewModule,
        TableModule,
        StoreModule.forRoot(REDUCERS),
        EffectsModule.forRoot(EFFECTS)
      ],
      declarations: [
        AccountPageComponent,
        AccountPreferencesComponent,
        UserDetailsComponent
      ],
      providers: [
        AuthenticationAdaptor,
        MessageService,
        ComicService,
        UserService
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
