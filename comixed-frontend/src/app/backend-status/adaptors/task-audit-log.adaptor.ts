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

import {Injectable} from '@angular/core';
import {LoggerService} from '@angular-ru/logger';
import {Store} from '@ngrx/store';
import {AppState} from 'app/backend-status';
import {BehaviorSubject, Observable} from 'rxjs';
import {TaskAuditLogEntry} from 'app/backend-status/models/task-audit-log-entry';
import {GetTaskAuditLogEntries} from 'app/backend-status/actions/task-audit-log.actions';
import {TASK_AUDIT_LOG_FEATURE_KEY, TaskAuditLogState} from 'app/backend-status/reducers/task-audit-log.reducer';
import {filter} from 'rxjs/operators';
import * as _ from 'lodash';

@Injectable({
    providedIn: 'root'
})
export class TaskAuditLogAdaptor {
    private _lastEntryDate$ = new BehaviorSubject<number>(0);
    private _fetchingEntries$ = new BehaviorSubject<boolean>(false);
    private _entries$ = new BehaviorSubject<TaskAuditLogEntry[]>([]);

    constructor(private logger: LoggerService, private store: Store<AppState>) {
        this.store
            .select(TASK_AUDIT_LOG_FEATURE_KEY)
            .pipe(filter(state => !!state))
            .subscribe((state: TaskAuditLogState) => {
                this.logger.debug('task audit log state changed:', state);
                if (!_.isEqual(this._lastEntryDate$.getValue(), state.lastEntryDate)) {
                    this._lastEntryDate$.next(state.lastEntryDate);
                }
                if (this._fetchingEntries$.getValue() !== state.fetchingEntries) {
                    this._fetchingEntries$.next(state.fetchingEntries);
                }
                if (!_.isEqual(this._entries$.getValue(), state.entries)) {
                    this._entries$.next(state.entries);
                }
            });
    }

    getEntries(): void {
        this.logger.debug(
            'getting task audit log entries:',
            this._lastEntryDate$.getValue()
        );
        this.store.dispatch(
            new GetTaskAuditLogEntries({cutoff: this._lastEntryDate$.getValue()})
        );
    }

    get lastEntryDate(): number {
        return this._lastEntryDate$.getValue();
    }

    get fetchingEntries$(): Observable<boolean> {
        return this._fetchingEntries$.asObservable();
    }

    get entries$(): Observable<TaskAuditLogEntry[]> {
        return this._entries$.asObservable();
    }
}
