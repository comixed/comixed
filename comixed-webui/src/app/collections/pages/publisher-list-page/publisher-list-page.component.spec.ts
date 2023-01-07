/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PublisherListPageComponent } from './publisher-list-page.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import {
  initialState as initialPublisherState,
  PUBLISHER_FEATURE_KEY
} from '@app/collections/reducers/publisher.reducer';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  initialState as initialUserState,
  USER_FEATURE_KEY
} from '@app/user/reducers/user.reducer';
import { USER_ADMIN } from '@app/user/user.fixtures';
import { TitleService } from '@app/core/services/title.service';
import { PUBLISHER_3 } from '@app/collections/collections.fixtures';

describe('PublisherListPageComponent', () => {
  const ENTRY = PUBLISHER_3;

  const initialState = {
    [PUBLISHER_FEATURE_KEY]: initialPublisherState,
    [USER_FEATURE_KEY]: { ...initialUserState, user: USER_ADMIN }
  };

  let component: PublisherListPageComponent;
  let fixture: ComponentFixture<PublisherListPageComponent>;
  let store: MockStore<any>;
  let storeDispatchSpy: jasmine.Spy;
  let translateService: TranslateService;
  let titleService: TitleService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PublisherListPageComponent],
      imports: [
        NoopAnimationsModule,
        RouterTestingModule.withRoutes([{ path: '*', redirectTo: '' }]),
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatToolbarModule,
        MatFormFieldModule,
        MatPaginatorModule,
        MatTableModule,
        MatSortModule,
        MatInputModule
      ],
      providers: [provideMockStore({ initialState }), TitleService]
    }).compileComponents();

    fixture = TestBed.createComponent(PublisherListPageComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    storeDispatchSpy = spyOn(store, 'dispatch');
    translateService = TestBed.inject(TranslateService);
    titleService = TestBed.inject(TitleService);
    spyOn(titleService, 'setTitle');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when the language is changed', () => {
    beforeEach(() => {
      translateService.use('fr');
    });

    it('updates the tab title', () => {
      expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('sorting the table', () => {
    it('can sort by publisher name', () => {
      expect(component.dataSource.sortingDataAccessor(ENTRY, 'name')).toEqual(
        ENTRY.name
      );
    });

    it('can sort by issue count', () => {
      expect(
        component.dataSource.sortingDataAccessor(ENTRY, 'issue-count')
      ).toEqual(ENTRY.issueCount);
    });

    it('ignores unknown sorts', () => {
      expect(component.dataSource.sortingDataAccessor(ENTRY, 'count')).toEqual(
        ''
      );
    });
  });
});
