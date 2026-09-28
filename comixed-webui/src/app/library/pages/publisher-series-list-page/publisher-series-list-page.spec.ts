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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PublisherSeriesListPage } from './publisher-series-list-page';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { provideTranslateService } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import {
  initialPublisherListState,
  PUBLISHER_LIST_FEATURE_KEY
} from '@app/library/reducers/publisher-list.reducer';
import {
  initialPublisherSeriesListState,
  PUBLISHER_SERIES_LIST_FEATURE_KEY,
  publisherSeriesListAdapter
} from '@app/library/reducers/publisher-series-list.reducer';
import { beforeEach, Mock } from 'vitest';
import { SERIES_1 } from '@app/library/library-fixtures';

describe('PublisherSeriesListPage', () => {
  const TEST_SERIES_LIST = [SERIES_1];
  const TEST_TOTAL_SERIES = 129;

  const initialState = {
    [PUBLISHER_SERIES_LIST_FEATURE_KEY]: publisherSeriesListAdapter.setAll(
      TEST_SERIES_LIST,
      {
        ...initialPublisherSeriesListState,
        total: TEST_TOTAL_SERIES
      }
    ),
    [PUBLISHER_LIST_FEATURE_KEY]: initialPublisherListState
  };

  let component: PublisherSeriesListPage;
  let fixture: ComponentFixture<PublisherSeriesListPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublisherSeriesListPage],
      providers: [
        provideRouter([{ path: '*', redirectTo: '' }]),
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideTranslateService(),
        provideMockStore({ initialState })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PublisherSeriesListPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  describe('changing the language', () => {
    let setTitleSpy: Mock;

    beforeEach(() => {
      setTitleSpy = vi.spyOn(component.titleService, 'setTitle');
      component.translateService.use('fr');
    });

    it('should update the page title', () => {
      expect(setTitleSpy).toHaveBeenCalled();
    });
  });
});
