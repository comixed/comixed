/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BlockedPageHashesComponent } from './blocked-page-hashes.component';
import {
  BLOCKED_PAGE_FEATURE_KEY,
  initialState as initialBlockedPageState
} from '@app/blocked-page/reducers/blocked-page.reducer';
import { LoggerModule } from '@angular-ru/logger';
import { provideMockStore } from '@ngrx/store/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { USER_ADMIN } from '@app/user/user.fixtures';
import {
  initialState as initialUserState,
  USER_FEATURE_KEY
} from '@app/user/reducers/user.reducer';
import { TitleService } from '@app/core';

describe('BlockedPageHashesComponent', () => {
  const USER = USER_ADMIN;
  const initialState = {
    [USER_FEATURE_KEY]: { ...initialUserState, user: USER },
    [BLOCKED_PAGE_FEATURE_KEY]: initialBlockedPageState
  };

  let component: BlockedPageHashesComponent;
  let fixture: ComponentFixture<BlockedPageHashesComponent>;
  let translateService: TranslateService;
  let titleService: TitleService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BlockedPageHashesComponent],
      imports: [LoggerModule.forRoot(), TranslateModule.forRoot()],
      providers: [provideMockStore({ initialState })]
    }).compileComponents();

    fixture = TestBed.createComponent(BlockedPageHashesComponent);
    component = fixture.componentInstance;
    translateService = TestBed.inject(TranslateService);
    titleService = TestBed.inject(TitleService);
    spyOn(titleService, 'setTitle');
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when the language changes', () => {
    beforeEach(() => {
      translateService.use('fr');
    });

    it('updates the page title', () => {
      expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
