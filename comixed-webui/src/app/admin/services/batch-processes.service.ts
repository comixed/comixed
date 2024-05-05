/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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

import { Injectable } from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { HttpClient } from '@angular/common/http';
import { Observable, Subscription } from 'rxjs';
import { interpolate } from '@app/core';
import {
  BATCH_PROCESS_LIST_UPDATE_TOPIC,
  DELETE_COMPLETED_BATCH_JOBS_URL,
  GET_ALL_BATCH_PROCESSES_URL
} from '@app/admin/admin.constants';
import { Store } from '@ngrx/store';
import { Subscription as StompSubscription } from 'webstomp-client';
import { selectMessagingState } from '@app/messaging/selectors/messaging.selectors';
import { WebSocketService } from '@app/messaging';
import { batchProcessUpdateReceived } from '@app/admin/actions/batch-processes.actions';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BatchProcessesService {
  messagingSubscription: Subscription;
  processListUpdateSubscription: StompSubscription;

  constructor(
    private logger: LoggerService,
    private http: HttpClient,
    private store: Store,
    private webSocketService: WebSocketService
  ) {
    this.messagingSubscription = this.store
      .select(selectMessagingState)
      .pipe(filter(state => !!state))
      .subscribe(state => {
        if (state.started && !this.processListUpdateSubscription) {
          this.processListUpdateSubscription = this.webSocketService.subscribe(
            BATCH_PROCESS_LIST_UPDATE_TOPIC,
            update => {
              this.logger.debug('Received batch process list update:', update);
              this.store.dispatch(batchProcessUpdateReceived({ update }));
            }
          );
        } else if (!state.started && !!this.processListUpdateSubscription) {
          this.logger.trace('Unsubscribing from batch process list updates');
          this.processListUpdateSubscription.unsubscribe();
          this.processListUpdateSubscription = null;
        }
      });
  }

  getAll(): Observable<any> {
    this.logger.trace('Loading all batch process statuses');
    return this.http.get(interpolate(GET_ALL_BATCH_PROCESSES_URL));
  }

  deleteCompletedBatchJobs(): Observable<any> {
    this.logger.trace('Deleting completed batch jobs');
    return this.http.post(interpolate(DELETE_COMPLETED_BATCH_JOBS_URL), {});
  }
}
