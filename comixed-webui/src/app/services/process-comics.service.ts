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

import { Injectable } from '@angular/core';
import { Subscription } from 'webstomp-client';
import { LoggerService } from '@angular-ru/cdk/logger';
import { WebSocketService } from '@app/messaging';
import { Store } from '@ngrx/store';
import { selectMessagingState } from '@app/messaging/selectors/messaging.selectors';
import {
  ADD_COMIC_BOOKS_TOPIC,
  PROCESS_COMIC_BOOKS_TOPIC
} from '@app/app.constants';
import {
  addComicBooksUpdate,
  processComicBooksUpdate
} from '@app/actions/process-comics.actions';
import { ProcessComicsStatus } from '@app/models/messages/process-comics-status';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProcessComicsService {
  addComicsSubscription: Subscription;
  processComicsSubscription: Subscription;

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private webSocketService: WebSocketService
  ) {
    this.store
      .select(selectMessagingState)
      .pipe(filter(state => !!state))
      .subscribe(state => {
        if (state.started) {
          if (!this.addComicsSubscription) {
            this.logger.trace('Subscribing to add comic updates');
            this.addComicsSubscription =
              this.webSocketService.subscribe<ProcessComicsStatus>(
                ADD_COMIC_BOOKS_TOPIC,
                update => {
                  this.logger.debug(
                    'Received add comic book count update:',
                    update
                  );
                  this.store.dispatch(
                    addComicBooksUpdate({
                      active: update.active,
                      started: update.started,
                      total: update.total,
                      processed: update.processed
                    })
                  );
                }
              );
          }
          if (!this.processComicsSubscription) {
            this.logger.trace('Subscribing to import count updates');
            this.processComicsSubscription =
              this.webSocketService.subscribe<ProcessComicsStatus>(
                PROCESS_COMIC_BOOKS_TOPIC,
                update => {
                  this.logger.debug(
                    'Received process comic status update:',
                    update
                  );
                  this.store.dispatch(
                    processComicBooksUpdate({
                      active: update.active,
                      started: update.started,
                      batchName: update.batchName,
                      stepName: update.stepName,
                      total: update.total,
                      processed: update.processed
                    })
                  );
                }
              );
          }
        } else if (!state.started) {
          if (!!this.addComicsSubscription) {
            this.logger.trace(
              'Unsubscribing from add comic books count updates'
            );
            this.addComicsSubscription.unsubscribe();
            this.addComicsSubscription = null;
          }
          if (!!this.processComicsSubscription) {
            this.logger.trace('Unsubscribing from process count updates');
            this.processComicsSubscription.unsubscribe();
            this.processComicsSubscription = null;
          }
        }
      });
  }
}
