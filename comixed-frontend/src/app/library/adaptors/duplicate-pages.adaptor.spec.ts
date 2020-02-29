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

import { DuplicatePagesAdaptors } from 'app/library/adaptors/duplicate-pages.adaptor';
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
  DuplicatePagesBlockingSet,
  DuplicatePagesDeletedSet,
  DuplicatePagesDeselect,
  DuplicatePagesGetAll,
  DuplicatePagesSelect,
  DuplicatePagesSetBlocking,
  DuplicatePagesSetBlockingFailed,
  DuplicatePagesSetDeleted,
  DuplicatePagesSetDeletedFailed
} from 'app/library/actions/duplicate-pages.actions';
import { DUPLICATE_PAGE_1 } from 'app/library/library.fixtures';
import { DuplicatePagesEffects } from 'app/library/effects/duplicate-pages.effects';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MessageService } from 'primeng/api';
import { DUPLICATE_PAGE_2 } from 'app/library/models/duplicate-page.fixtures';
import { LoggerTestingModule } from 'ngx-logger/testing';

describe('DuplicatePagesAdaptors', () => {
  const PAGES = [DUPLICATE_PAGE_1, DUPLICATE_PAGE_2];

  let adaptor: DuplicatePagesAdaptors;
  let store: Store<AppState>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        LoggerTestingModule,
        StoreModule.forRoot({}),
        StoreModule.forFeature(DUPLICATE_PAGES_FEATURE_KEY, reducer),
        EffectsModule.forRoot([]),
        EffectsModule.forFeature([DuplicatePagesEffects])
      ],
      providers: [DuplicatePagesAdaptors, MessageService]
    });

    adaptor = TestBed.get(DuplicatePagesAdaptors);
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
        store.dispatch(new DuplicatePagesAllReceived({ pages: PAGES }));
      });

      it('updates the list of pages', () => {
        adaptor.pages$.subscribe(response => expect(response).toEqual(PAGES));
      });

      it('provides updates', () => {
        adaptor.fetchingAll$.subscribe(response =>
          expect(response).toBeFalsy()
        );
      });
    });
  });

  describe('selecting pages', () => {
    beforeEach(() => {
      adaptor.selectPages(PAGES);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        new DuplicatePagesSelect({ pages: PAGES })
      );
    });

    it('provides updates', () => {
      adaptor.selected$.subscribe(response => expect(response).toEqual(PAGES));
    });

    describe('deselecting pages', () => {
      const DESELECTED = PAGES[1];

      beforeEach(() => {
        adaptor.deselectPages([DESELECTED]);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          new DuplicatePagesDeselect({ pages: [DESELECTED] })
        );
      });

      it('provides updates', () => {
        adaptor.selected$.subscribe(response =>
          expect(response).not.toContain(DESELECTED)
        );
      });
    });
  });

  describe('setting the blocking state for pages', () => {
    beforeEach(() => {
      adaptor.setBlocking(PAGES, true);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        new DuplicatePagesSetBlocking({ pages: PAGES, blocking: true })
      );
    });

    it('provides updates', () => {
      adaptor.setBlocking$.subscribe(response => expect(response).toBeTruthy());
    });

    describe('success', () => {
      beforeEach(() => {
        store.dispatch(new DuplicatePagesBlockingSet({ pages: PAGES }));
      });

      it('provides updates', () => {
        adaptor.setBlocking$.subscribe(response =>
          expect(response).toBeFalsy()
        );
      });

      it('updates the duplicate pages', () => {
        adaptor.pages$.subscribe(response => expect(response).toEqual(PAGES));
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        store.dispatch(new DuplicatePagesSetBlockingFailed());
      });

      it('provides updates', () => {
        adaptor.setBlocking$.subscribe(response =>
          expect(response).toBeFalsy()
        );
      });
    });
  });

  describe('setting the deleted state for duplicate pages', () => {
    beforeEach(() => {
      adaptor.setDeleted(PAGES, true);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        new DuplicatePagesSetDeleted({ pages: PAGES, deleted: true })
      );
    });

    it('provides updates on setting deleted', () => {
      adaptor.setDeleted$.subscribe(response => expect(response).toBeTruthy());
    });

    describe('success', () => {
      beforeEach(() => {
        store.dispatch(new DuplicatePagesDeletedSet({ pages: PAGES }));
      });

      it('updates the duplicate pages', () => {
        adaptor.pages$.subscribe(response => expect(response).toEqual(PAGES));
      });

      it('provides updates on setting deleted', () => {
        adaptor.setDeleted$.subscribe(response => expect(response).toBeFalsy());
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        store.dispatch(new DuplicatePagesSetDeletedFailed());
      });

      it('provides updates on setting deleted', () => {
        adaptor.setDeleted$.subscribe(response => expect(response).toBeFalsy());
      });
    });
  });
});
