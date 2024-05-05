/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2024, The ComiXed Project
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
import { BatchProcessDetailDialogComponent } from './batch-process-detail-dialog.component';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { MatListModule } from '@angular/material/list';
import {
  BATCH_PROCESSES_FEATURE_KEY,
  initialState as initialBatchProcessState
} from '@app/admin/reducers/batch-processes.reducer';
import { BATCH_PROCESS_DETAIL_1 } from '@app/admin/admin.fixtures';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { WebSocketService } from '@app/messaging';
import { Subscription } from 'webstomp-client';
import {
  initialState as initialMessagingState,
  MESSAGING_FEATURE_KEY
} from '@app/messaging/reducers/messaging.reducer';
import { interpolate } from '@app/core';
import { BATCH_PROCESS_DETAIL_UPDATE_TOPIC } from '@app/app.constants';
import { setBatchProcessDetail } from '@app/admin/actions/batch-processes.actions';
import { MatDialogModule } from '@angular/material/dialog';

describe('BatchProcessDetailDialogComponent', () => {
  const DETAIL = BATCH_PROCESS_DETAIL_1;
  const initialState = {
    [BATCH_PROCESSES_FEATURE_KEY]: {
      ...initialBatchProcessState,
      detail: DETAIL
    },
    [MESSAGING_FEATURE_KEY]: { ...initialMessagingState }
  };

  let component: BatchProcessDetailDialogComponent;
  let fixture: ComponentFixture<BatchProcessDetailDialogComponent>;
  let store: MockStore;
  let webSocketService: jasmine.SpyObj<WebSocketService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BatchProcessDetailDialogComponent],
      imports: [
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatListModule,
        MatDialogModule
      ],
      providers: [
        provideMockStore({ initialState }),
        {
          provide: ActivatedRoute,
          useValue: {
            params: new BehaviorSubject<{}>({
              jobId: `${DETAIL.jobId}`
            }),
            queryParams: new BehaviorSubject<{}>({}),
            snapshot: {} as ActivatedRouteSnapshot
          }
        },
        {
          provide: WebSocketService,
          useValue: {
            subscribe: jasmine.createSpy('WebSocketService.subscribe()'),
            unsubscribe: jasmine.createSpy('WebSocketService.unsubscribe()')
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BatchProcessDetailDialogComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    webSocketService = TestBed.inject(
      WebSocketService
    ) as jasmine.SpyObj<WebSocketService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('subscribing to batch process updates', () => {
    const TOPIC = interpolate(BATCH_PROCESS_DETAIL_UPDATE_TOPIC, {
      jobId: DETAIL.jobId
    });

    beforeEach(() => {
      component.detail = DETAIL;
      component.detailUpdateSubscription = null;
      webSocketService.subscribe.and.callFake((topic, callback) => {
        callback(DETAIL);
        return {} as Subscription;
      });
      store.setState({
        ...initialState,
        [MESSAGING_FEATURE_KEY]: {
          ...initialMessagingState,
          started: true
        }
      });
    });

    it('subscribes to the task topic', () => {
      expect(webSocketService.subscribe).toHaveBeenCalledWith(
        TOPIC,
        jasmine.anything()
      );
    });

    it('publishes the update', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        setBatchProcessDetail({
          detail: DETAIL
        })
      );
    });
  });
});
