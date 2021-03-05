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

import { Injectable } from '@angular/core';
import { WebSocketService } from '@app/services/web-socket.service';
import { LoggerService } from '@angular-ru/logger';
import { setTaskCount } from '@app/actions/server-status.actions';
import { TaskCountMessage } from '@app/models/net/task-count-message';
import { Subscription } from 'webstomp-client';
import { Store } from '@ngrx/store';
import { TASK_COUNT_TOPIC } from '@app/app.constants';

@Injectable({
  providedIn: 'root'
})
export class TaskCountService {
  subscription: Subscription;

  constructor(
    private logger: LoggerService,
    private webSocketService: WebSocketService,
    private store: Store<any>
  ) {}

  start(): void {
    this.logger.debug('Starting the import count service');
    this.subscription = this.webSocketService.subscribe(
      TASK_COUNT_TOPIC,
      frame => {
        const message = JSON.parse(frame.body) as TaskCountMessage;
        this.logger.trace('Task message:', message);
        this.store.dispatch(
          setTaskCount({
            count: message.count
          })
        );
      }
    );
  }

  stop(): void {
    this.logger.debug('Stopping the import count service');
    this.subscription.unsubscribe();
  }
}
