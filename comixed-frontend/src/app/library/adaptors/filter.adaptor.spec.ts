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

import { FilterAdaptor } from './filter.adaptor';
import { TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import {
  FILTERS_FEATURE_KEY,
  reducer
} from 'app/library/reducers/filters.reducer';
import { COMIC_2 } from 'app/comics/models/comic.fixtures';
import { AppState } from 'app/library';
import {
  FiltersClear,
  FiltersSetPublisher,
  FiltersSetSeries
} from 'app/library/actions/filters.actions';

describe('FilterAdaptor', () => {
  let adaptor: FilterAdaptor;
  let store: Store<AppState>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({}),
        StoreModule.forFeature(FILTERS_FEATURE_KEY, reducer)
      ],
      providers: [FilterAdaptor]
    });

    adaptor = TestBed.get(FilterAdaptor);
    store = TestBed.get(Store);
    spyOn(store, 'dispatch').and.callThrough();
  });

  it('should create an instance', () => {
    expect(adaptor).toBeTruthy();
  });

  describe('settings the publisher', () => {
    const PUBLISHER = COMIC_2.publisher;

    beforeEach(() => {
      adaptor.setPublisher(PUBLISHER);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        new FiltersSetPublisher({ name: PUBLISHER })
      );
    });

    it('provides an update', () => {
      adaptor.publisher$.subscribe(response =>
        expect(response).toEqual(PUBLISHER)
      );
    });
  });

  describe('settings the series', () => {
    const SERIES = COMIC_2.series;

    beforeEach(() => {
      adaptor.setSeries(SERIES);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        new FiltersSetSeries({ name: SERIES })
      );
    });

    it('provides an update', () => {
      adaptor.series$.subscribe(response => expect(response).toEqual(SERIES));
    });
  });

  describe('clearing the filters', () => {
    beforeEach(() => {
      adaptor.clearFilters();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(new FiltersClear());
    });
  });
});
