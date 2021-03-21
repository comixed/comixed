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

import { TestBed } from '@angular/core/testing';

import { ScanTypeService } from './scan-type.service';
import { WebSocketService } from '@app/messaging';
import {
  initialState as initialMessagingState,
  MESSAGING_FEATURE_KEY
} from '@app/messaging/reducers/messaging.reducer';
import { Subscription } from 'webstomp-client';
import { scanTypeAdded } from '@app/library/actions/scan-type.actions';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import {
  LOAD_SCAN_TYPES_MESSAGE,
  SCAN_TYPE_UPDATE_TOPIC
} from '@app/library/library.constants';
import { LoggerModule } from '@angular-ru/logger';
import { SCAN_TYPE_1, SCAN_TYPE_2 } from '@app/library/library.fixtures';

describe('ScanTypeService', () => {
  const initialState = {
    [MESSAGING_FEATURE_KEY]: { ...initialMessagingState }
  };

  let service: ScanTypeService;
  let webSocketService: jasmine.SpyObj<WebSocketService>;
  const subscription = jasmine.createSpyObj(['unsubscribe']);
  subscription.unsubscribe = jasmine.createSpy('Subscription.unsubscribe()');
  let store: MockStore<any>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoggerModule.forRoot()],
      providers: [
        provideMockStore({ initialState }),
        {
          provide: WebSocketService,
          useValue: {
            subscribe: jasmine.createSpy('WebSocketService.subscribe()'),
            send: jasmine.createSpy('WebSocketService.send()'),
            requestResponse: jasmine.createSpy(
              'WebSocketService.requestResponse()'
            )
          }
        }
      ]
    });

    service = TestBed.inject(ScanTypeService);
    webSocketService = TestBed.inject(
      WebSocketService
    ) as jasmine.SpyObj<WebSocketService>;
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('when messaging starts', () => {
    const TYPE_1 = SCAN_TYPE_1;
    const TYPE_2 = SCAN_TYPE_2;

    beforeEach(() => {
      webSocketService.requestResponse.and.callFake(
        (message, body, destination, callback) => {
          callback(TYPE_1);
          return {} as Subscription;
        }
      );
      webSocketService.subscribe.and.callFake((destination, callback) => {
        callback(TYPE_2);
        return {} as Subscription;
      });
      store.setState({
        ...initialState,
        [MESSAGING_FEATURE_KEY]: { ...initialMessagingState, started: true }
      });
    });

    it('requests the initial load of scan types', () => {
      expect(webSocketService.requestResponse).toHaveBeenCalledWith(
        LOAD_SCAN_TYPES_MESSAGE,
        '',
        SCAN_TYPE_UPDATE_TOPIC,
        jasmine.anything()
      );
    });

    it('processes scan types received on the initial load', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        scanTypeAdded({ scanType: TYPE_1 })
      );
    });

    it('subscribes to the scan type update topic', () => {
      expect(webSocketService.subscribe).toHaveBeenCalledWith(
        SCAN_TYPE_UPDATE_TOPIC,
        jasmine.anything()
      );
    });

    it('processes scan types received on the subscription', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        scanTypeAdded({ scanType: TYPE_2 })
      );
    });
  });

  describe('when messaging stops', () => {
    beforeEach(() => {
      service.subscription = subscription;
      store.setState({
        ...initialState,
        [MESSAGING_FEATURE_KEY]: { ...initialMessagingState, started: false }
      });
    });

    it('unsubscribes from the add scan type queue', () => {
      expect(subscription.unsubscribe).toHaveBeenCalled();
    });

    it('clears the subscription', () => {
      expect(service.subscription).toBeNull();
    });
  });
});
