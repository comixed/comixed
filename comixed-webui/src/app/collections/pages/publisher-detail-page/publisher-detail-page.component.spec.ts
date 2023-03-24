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
import { PublisherDetailPageComponent } from './publisher-detail-page.component';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { RouterTestingModule } from '@angular/router/testing';
import { TitleService } from '@app/core/services/title.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  PUBLISHER_3,
  SERIES_1,
  SERIES_3,
  SERIES_5
} from '@app/collections/collections.fixtures';
import {
  initialState as initialPublisherState,
  PUBLISHER_FEATURE_KEY
} from '@app/collections/reducers/publisher.reducer';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('PublisherDetailPageComponent', () => {
  const initialState = { [PUBLISHER_FEATURE_KEY]: initialPublisherState };
  const PUBLISHER = PUBLISHER_3;
  const DETAIL = [SERIES_1, SERIES_3, SERIES_5];

  let component: PublisherDetailPageComponent;
  let fixture: ComponentFixture<PublisherDetailPageComponent>;
  let titleService: TitleService;
  let translateService: TranslateService;
  let store: MockStore<any>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PublisherDetailPageComponent],
      imports: [
        NoopAnimationsModule,
        RouterTestingModule.withRoutes([{ path: '*', redirectTo: '' }]),
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatTableModule,
        MatPaginatorModule,
        MatToolbarModule,
        MatSortModule,
        MatFormFieldModule,
        MatInputModule
      ],
      providers: [provideMockStore({ initialState }), TitleService]
    }).compileComponents();

    fixture = TestBed.createComponent(PublisherDetailPageComponent);
    component = fixture.componentInstance;
    titleService = TestBed.inject(TitleService);
    spyOn(titleService, 'setTitle');
    translateService = TestBed.inject(TranslateService);
    store = TestBed.inject(MockStore);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('changing the active language', () => {
    beforeEach(() => {
      translateService.use('fr');
    });

    it('updates the tab title', () => {
      expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('loading the publisher details', () => {
    beforeEach(() => {
      component.dataSource.data = [];
      store.setState({
        ...initialState,
        [PUBLISHER_FEATURE_KEY]: { ...initialPublisherState, detail: DETAIL }
      });
    });

    it('populates the table data source', () => {
      expect(component.dataSource.data).toEqual(DETAIL);
    });
  });

  describe('sorting data', () => {
    const ENTRY = SERIES_1;

    it('can sort by series', () => {
      expect(component.dataSource.sortingDataAccessor(ENTRY, 'series')).toEqual(
        ENTRY.name
      );
    });

    it('can sort by volume', () => {
      expect(component.dataSource.sortingDataAccessor(ENTRY, 'volume')).toEqual(
        ENTRY.volume
      );
    });

    it('can sort by total issues', () => {
      expect(
        component.dataSource.sortingDataAccessor(ENTRY, 'total-issues')
      ).toEqual(ENTRY.totalIssues);
    });

    it('can sort by issues in library', () => {
      expect(
        component.dataSource.sortingDataAccessor(ENTRY, 'in-library')
      ).toEqual(ENTRY.inLibrary);
    });

    it('ignores unknown fields', () => {
      expect(component.dataSource.sortingDataAccessor(ENTRY, 'in-')).toEqual(
        ''
      );
    });
  });
});
