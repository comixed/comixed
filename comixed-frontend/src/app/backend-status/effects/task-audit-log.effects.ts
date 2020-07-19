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
import { Actions, Effect, ofType } from '@ngrx/effects';
import {
  GetTaskAuditLogEntriesFailed,
  ReceivedTaskAuditLogEntries,
  TaskAuditLogActions,
  TaskAuditLogActionTypes
} from '../actions/task-audit-log.actions';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { LoggerService } from '@angular-ru/logger';
import { TaskAuditLogService } from 'app/backend-status/services/task-audit-log.service';
import { TaskAuditLogEntry } from 'app/backend-status/models/task-audit-log-entry';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class TaskAuditLogEffects {
  constructor(
    private actions$: Actions<TaskAuditLogActions>,
    private logger: LoggerService,
    private taskAuditLogService: TaskAuditLogService,
    private messageService: MessageService,
    private translateService: TranslateService
  ) {}

  @Effect()
  getLogEntries$: Observable<Action> = this.actions$.pipe(
    ofType(TaskAuditLogActionTypes.GetEntries),
    map(action => action.payload),
    tap(action =>
      this.logger.debug('effect: getting task audit log entries:', action)
    ),
    switchMap(action =>
      this.taskAuditLogService.getLogEntries(action.cutoff).pipe(
        tap(response => this.logger.debug('received response:', response)),
        map(
          (response: TaskAuditLogEntry[]) =>
            new ReceivedTaskAuditLogEntries({ entries: response })
        ),
        catchError(error => {
          this.logger.error(
            'service failure getting task audit log entries:',
            error
          );
          this.messageService.add({
            severity: 'error',
            detail: this.translateService.instant(
              'task-audit-log-effects.get-log-entries.error.detail'
            )
          });
          return of(new GetTaskAuditLogEntriesFailed());
        })
      )
    ),
    catchError(error => {
      this.logger.error(
        'general failure getting task audit log entries:',
        error
      );
      this.messageService.add({
        severity: 'error',
        detail: this.translateService.instant(
          'general-message.error.general-service-failure'
        )
      });
      return of(new GetTaskAuditLogEntriesFailed());
    })
  );
}
