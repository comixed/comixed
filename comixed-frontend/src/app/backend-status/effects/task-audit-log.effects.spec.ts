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

import {TestBed} from '@angular/core/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {Observable, of, throwError} from 'rxjs';

import {TaskAuditLogEffects} from './task-audit-log.effects';
import {TaskAuditLogService} from 'app/backend-status/services/task-audit-log.service';
import {
    TASK_AUDIT_LOG_ENTRY_1,
    TASK_AUDIT_LOG_ENTRY_2,
    TASK_AUDIT_LOG_ENTRY_3,
    TASK_AUDIT_LOG_ENTRY_4,
    TASK_AUDIT_LOG_ENTRY_5
} from 'app/backend-status/backend-status.fixtures';
import {
    GetTaskAuditLogEntries,
    GetTaskAuditLogEntriesFailed,
    ReceivedTaskAuditLogEntries
} from 'app/backend-status/actions/task-audit-log.actions';
import {hot} from 'jasmine-marbles';
import {HttpErrorResponse} from '@angular/common/http';
import {MessageService} from 'primeng/api';
import {LoggerModule} from '@angular-ru/logger';
import {TranslateModule} from '@ngx-translate/core';
import objectContaining = jasmine.objectContaining;

describe('TaskAuditLogEffects', () => {
    const LOG_ENTRIES = [
        TASK_AUDIT_LOG_ENTRY_1,
        TASK_AUDIT_LOG_ENTRY_2,
        TASK_AUDIT_LOG_ENTRY_3,
        TASK_AUDIT_LOG_ENTRY_4,
        TASK_AUDIT_LOG_ENTRY_5
    ];

    let actions$: Observable<any>;
    let effects: TaskAuditLogEffects;
    let taskAuditLogService: jasmine.SpyObj<TaskAuditLogService>;
    let messageService: MessageService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [LoggerModule.forRoot(), TranslateModule.forRoot()],
            providers: [
                TaskAuditLogEffects,
                provideMockActions(() => actions$),
                {
                    provide: TaskAuditLogService,
                    useValue: {
                        getLogEntries: jasmine.createSpy(
                            'TaskAuditLogService.getLogEntries()'
                        )
                    }
                },
                MessageService
            ]
        });

        effects = TestBed.get<TaskAuditLogEffects>(TaskAuditLogEffects);
        taskAuditLogService = TestBed.get(TaskAuditLogService);
        messageService = TestBed.get(MessageService);
        spyOn(messageService, 'add');
    });

    it('should be created', () => {
        expect(effects).toBeTruthy();
    });

    describe('getting the list of log entries', () => {
        it('fires an action on success', () => {
            const serviceResponse = LOG_ENTRIES;
            const action = new GetTaskAuditLogEntries({
                cutoff: new Date().getTime()
            });
            const outcome = new ReceivedTaskAuditLogEntries({entries: LOG_ENTRIES});

            actions$ = hot('-a', {a: action});
            taskAuditLogService.getLogEntries.and.returnValue(of(serviceResponse));

            const expected = hot('-b', {b: outcome});
            expect(effects.getLogEntries$).toBeObservable(expected);
        });

        it('fires an action on service failure', () => {
            const serviceResponse = new HttpErrorResponse({});
            const action = new GetTaskAuditLogEntries({
                cutoff: new Date().getTime()
            });
            const outcome = new GetTaskAuditLogEntriesFailed();

            actions$ = hot('-a', {a: action});
            taskAuditLogService.getLogEntries.and.returnValue(
                throwError(serviceResponse)
            );

            const expected = hot('-b', {b: outcome});
            expect(effects.getLogEntries$).toBeObservable(expected);
            expect(messageService.add).toHaveBeenCalledWith(
                objectContaining({severity: 'error'})
            );
        });

        it('fires an action on general failure', () => {
            const action = new GetTaskAuditLogEntries({
                cutoff: new Date().getTime()
            });
            const outcome = new GetTaskAuditLogEntriesFailed();

            actions$ = hot('-a', {a: action});
            taskAuditLogService.getLogEntries.and.throwError('expected');

            const expected = hot('-(b|)', {b: outcome});
            expect(effects.getLogEntries$).toBeObservable(expected);
            expect(messageService.add).toHaveBeenCalledWith(
                objectContaining({severity: 'error'})
            );
        });
    });
});
