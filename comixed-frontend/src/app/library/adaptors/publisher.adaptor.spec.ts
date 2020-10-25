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

import { PublisherAdaptor } from './publisher.adaptor';
import { TestBed } from '@angular/core/testing';
import { PUBLISHER_1 } from 'app/library/models/publisher.fixtures';
import {
  PUBLISHER_FEATURE_KEY,
  reducer
} from 'app/library/reducers/publisher.reducer';
import { Store, StoreModule } from '@ngrx/store';
import { PublisherEffects } from 'app/library/effects/publisher.effects';
import { EffectsModule } from '@ngrx/effects';
import { LibraryModuleState } from 'app/library';
import {
  PublisherGet,
  PublisherGetFailed,
  PublisherReceived
} from 'app/library/actions/publisher.actions';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MessageService } from 'primeng/api';
import { TranslateModule } from '@ngx-translate/core';
import { LoggerModule } from '@angular-ru/logger';

describe('PublisherAdaptor', () => {
  const PUBLISHER = PUBLISHER_1;
  const PUBLISHER_NAME = PUBLISHER.name;

  let adaptor: PublisherAdaptor;
  let store: Store<LibraryModuleState>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        StoreModule.forRoot({}),
        StoreModule.forFeature(PUBLISHER_FEATURE_KEY, reducer),
        EffectsModule.forRoot([]),
        EffectsModule.forFeature([PublisherEffects]),
        TranslateModule.forRoot(),
        LoggerModule.forRoot()
      ],
      providers: [PublisherAdaptor, MessageService]
    });

    adaptor = TestBed.get(PublisherAdaptor);
    store = TestBed.get(Store);
    spyOn(store, 'dispatch').and.callThrough();
  });

  it('should create an instance', () => {
    expect(adaptor).toBeTruthy();
  });

  describe('getting a single publisher', () => {
    beforeEach(() => {
      adaptor.getPublisherByName(PUBLISHER_NAME);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        new PublisherGet({ name: PUBLISHER_NAME })
      );
    });

    it('provides updates on fetching the publisher', () => {
      adaptor.fetchingPublisher$.subscribe(response =>
        expect(response).toBeTruthy()
      );
    });

    it('provides updates on no such publisher', () => {
      adaptor.noSuchPublisher$.subscribe(response =>
        expect(response).toBeFalsy()
      );
    });

    describe('success', () => {
      beforeEach(() => {
        store.dispatch(new PublisherReceived({ publisher: PUBLISHER }));
      });

      it('updates the publisher', () => {
        adaptor.publisher$.subscribe(response =>
          expect(response).toEqual(PUBLISHER)
        );
      });

      it('provides updates on fetching the publisher', () => {
        adaptor.fetchingPublisher$.subscribe(response =>
          expect(response).toBeFalsy()
        );
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        store.dispatch(new PublisherGetFailed());
      });

      it('updates the publisher', () => {
        adaptor.publisher$.subscribe(response => expect(response).toBeNull());
      });

      it('provides updates on fetching the publisher', () => {
        adaptor.fetchingPublisher$.subscribe(response =>
          expect(response).toBeFalsy()
        );
      });

      it('provides updates on no such publisher', () => {
        adaptor.noSuchPublisher$.subscribe(response =>
          expect(response).toBeTruthy()
        );
      });
    });
  });
});
