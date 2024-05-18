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
import { Subscription } from 'rxjs';
import { LoggerService } from '@angular-ru/cdk/logger';
import { WebSocketService } from '@app/messaging';
import { Store } from '@ngrx/store';
import { selectMessagingState } from '@app/messaging/selectors/messaging.selectors';
import { PROCESS_COMIC_BOOKS_TOPIC } from '@app/app.constants';
import { processComicBooksUpdate } from '@app/actions/process-comics.actions';
import { ProcessComicBooksStatus } from '@app/models/messages/process-comic-books-status';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProcessComicsService {
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
          if (!this.processComicsSubscription) {
            this.logger.trace('Subscribing to import count updates');
            this.processComicsSubscription =
              this.webSocketService.subscribe<ProcessComicBooksStatus>(
                PROCESS_COMIC_BOOKS_TOPIC,
                update => {
                  this.logger.debug(
                    'Received process comic status update:',
                    update
                  );
                  this.store.dispatch(
                    processComicBooksUpdate({
                      active: update.active,
                      stepName: update.stepName,
                      total: update.total,
                      processed: update.processed
                    })
                  );
                }
              );
          }
        } else if (!state.started) {
          if (!!this.processComicsSubscription) {
            this.logger.trace('Unsubscribing from process count updates');
            this.processComicsSubscription.unsubscribe();
            this.processComicsSubscription = null;
          }
        }
      });
  }
}
