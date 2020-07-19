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

import { TaskAuditLogAdaptor } from './task-audit-log.adaptor';
import {
  TASK_AUDIT_LOG_ENTRY_1,
  TASK_AUDIT_LOG_ENTRY_2,
  TASK_AUDIT_LOG_ENTRY_3,
  TASK_AUDIT_LOG_ENTRY_4,
  TASK_AUDIT_LOG_ENTRY_5
} from 'app/backend-status/models/task-audit-log-entry.fixtures';
import { TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { AppState } from 'app/backend-status';
import {
  GetTaskAuditLogEntries,
  GetTaskAuditLogEntriesFailed,
  ReceivedTaskAuditLogEntries
} from 'app/backend-status/actions/task-audit-log.actions';
import { LoggerModule } from '@angular-ru/logger';
import {
  reducer,
  TASK_AUDIT_LOG_FEATURE_KEY
} from 'app/backend-status/reducers/task-audit-log.reducer';
import { EffectsModule } from '@ngrx/effects';
import { TaskAuditLogEffects } from 'app/backend-status/effects/task-audit-log.effects';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MessageService } from 'primeng/api';
import { TranslateModule } from '@ngx-translate/core';

describe('TaskAuditLogAdaptor', () => {
  const LAST_ENTRY_DATE = new Date().getTime();
  const LOG_ENTRIES = [
    TASK_AUDIT_LOG_ENTRY_1,
    TASK_AUDIT_LOG_ENTRY_2,
    TASK_AUDIT_LOG_ENTRY_3,
    TASK_AUDIT_LOG_ENTRY_4,
    TASK_AUDIT_LOG_ENTRY_5
  ];

  let taskAuditLogAdaptor: TaskAuditLogAdaptor;
  let store: Store<AppState>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        StoreModule.forRoot({}),
        StoreModule.forFeature(TASK_AUDIT_LOG_FEATURE_KEY, reducer),
        EffectsModule.forRoot([]),
        EffectsModule.forFeature([TaskAuditLogEffects])
      ],
      providers: [TaskAuditLogAdaptor, MessageService]
    });

    taskAuditLogAdaptor = TestBed.get(TaskAuditLogAdaptor);
    store = TestBed.get(Store);
    spyOn(store, 'dispatch').and.callThrough();
  });

  it('should create an instance', () => {
    expect(taskAuditLogAdaptor).toBeTruthy();
  });

  describe('getting the list of task audit log entries', () => {
    let lastEntryDate: number;

    beforeEach(() => {
      lastEntryDate = taskAuditLogAdaptor.lastEntryDate;
      taskAuditLogAdaptor.getEntries();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        new GetTaskAuditLogEntries({ cutoff: lastEntryDate })
      );
    });

    it('provides updates on fetching', () => {
      taskAuditLogAdaptor.fetchingEntries$.subscribe(response =>
        expect(response).toBeTruthy()
      );
    });

    describe('success', () => {
      beforeEach(() => {
        store.dispatch(
          new ReceivedTaskAuditLogEntries({ entries: LOG_ENTRIES })
        );
      });

      it('provides updates on fetching', () => {
        taskAuditLogAdaptor.fetchingEntries$.subscribe(response =>
          expect(response).toBeFalsy()
        );
      });

      it('provides updates on the log entries', () => {
        taskAuditLogAdaptor.entries$.subscribe(response =>
          expect(response).toEqual(LOG_ENTRIES)
        );
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        store.dispatch(new GetTaskAuditLogEntriesFailed());
      });

      it('provides updates on fetching', () => {
        taskAuditLogAdaptor.fetchingEntries$.subscribe(response =>
          expect(response).toBeFalsy()
        );
      });
    });
  });
});
