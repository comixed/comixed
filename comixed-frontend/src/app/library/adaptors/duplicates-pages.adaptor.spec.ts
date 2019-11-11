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
 * along with this program. If not, see <http:/www.gnu.org/licenses>
 */

import { DuplicatesPagesAdaptors } from './duplicates-pages.adaptor';
import { TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import {
  DUPLICATE_PAGES_FEATURE_KEY,
  reducer
} from 'app/library/reducers/duplicate-pages.reducer';
import { EffectsModule } from '@ngrx/effects';
import { TranslateModule } from '@ngx-translate/core';
import { AppState } from 'app/library';
import {
  DuplicatePagesAllReceived,
  DuplicatePagesGetAll
} from 'app/library/actions/duplicate-pages.actions';
import { DUPLICATE_PAGE_1 } from 'app/library/library.fixtures';
import { DuplicatePagesEffects } from 'app/library/effects/duplicate-pages.effects';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MessageService } from 'primeng/api';

describe('DuplicatesPagesAdaptors', () => {
  const DUPLICATE_PAGES = [DUPLICATE_PAGE_1];

  let adaptor: DuplicatesPagesAdaptors;
  let store: Store<AppState>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        StoreModule.forRoot({}),
        StoreModule.forFeature(DUPLICATE_PAGES_FEATURE_KEY, reducer),
        EffectsModule.forRoot([]),
        EffectsModule.forFeature([DuplicatePagesEffects])
      ],
      providers: [DuplicatesPagesAdaptors, MessageService]
    });

    adaptor = TestBed.get(DuplicatesPagesAdaptors);
    store = TestBed.get(Store);
    spyOn(store, 'dispatch').and.callThrough();
  });

  it('should create an instance', () => {
    expect(adaptor).toBeTruthy();
  });

  describe('getting all duplicate pages', () => {
    beforeEach(() => {
      adaptor.getAll();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(new DuplicatePagesGetAll());
    });

    it('provides updates', () => {
      adaptor.fetchingAll$.subscribe(response => expect(response).toBeTruthy());
    });

    describe('success', () => {
      beforeEach(() => {
        store.dispatch(
          new DuplicatePagesAllReceived({ pages: DUPLICATE_PAGES })
        );
      });

      it('updates the list of pages', () => {
        adaptor.pages$.subscribe(response =>
          expect(response).toEqual(DUPLICATE_PAGES)
        );
      });

      it('provides updates', () => {
        adaptor.fetchingAll$.subscribe(response =>
          expect(response).toBeFalsy()
        );
      });
    });
  });
});
