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

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskAuditLogPageComponent } from './task-audit-log-page.component';
import { LoggerModule } from '@angular-ru/logger';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  initialState as initialTaskAuditLogState,
  TASK_AUDIT_LOG_FEATURE_KEY
} from '@app/admin/reducers/task-audit-log.reducer';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTableModule } from '@angular/material/table';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TitleService } from '@app/core/services/title.service';
import {
  loadTaskAuditLogEntries,
  resetTaskAuditLog
} from '@app/admin/actions/task-audit-log.actions';
import {
  TASK_AUDIT_LOG_ENTRY_1,
  TASK_AUDIT_LOG_ENTRY_2
} from '@app/admin/admin.fixtures';

describe('TaskAuditLogPageComponent', () => {
  const ENTRY = TASK_AUDIT_LOG_ENTRY_1;

  const initialState = {
    [TASK_AUDIT_LOG_FEATURE_KEY]: initialTaskAuditLogState
  };

  let component: TaskAuditLogPageComponent;
  let fixture: ComponentFixture<TaskAuditLogPageComponent>;
  let store: MockStore<any>;
  let translateService: TranslateService;
  let titleService: TitleService;
  let storeDispatchSpy: jasmine.Spy;
  let titleServiceSpy: jasmine.Spy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TaskAuditLogPageComponent],
      imports: [
        NoopAnimationsModule,
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatToolbarModule,
        MatSidenavModule,
        MatTableModule
      ],
      providers: [provideMockStore({ initialState })]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskAuditLogPageComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    storeDispatchSpy = spyOn(store, 'dispatch');
    translateService = TestBed.inject(TranslateService);
    titleService = TestBed.inject(TitleService);
    titleServiceSpy = spyOn(titleService, 'setTitle');
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('sets the title', () => {
    expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
  });

  it('resets the task audit log feature', () => {
    expect(store.dispatch).toHaveBeenCalledWith(resetTaskAuditLog());
  });

  describe('when the language changes', () => {
    beforeEach(() => {
      titleServiceSpy.calls.reset();
      translateService.use('fr');
    });

    it('updates the title', () => {
      expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('loading audit log entries', () => {
    beforeEach(() => {
      storeDispatchSpy.calls.reset();
    });

    describe('when not the last page', () => {
      const LATEST = new Date().getTime();

      beforeEach(() => {
        store.setState({
          ...initialState,
          [TASK_AUDIT_LOG_FEATURE_KEY]: {
            ...initialTaskAuditLogState,
            loading: false,
            lastPage: false,
            latest: LATEST
          }
        });
      });

      it('fetches another batch', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          loadTaskAuditLogEntries({ latest: LATEST })
        );
      });
    });

    describe('when the last page', () => {
      const LATEST = new Date().getTime();

      beforeEach(() => {
        store.setState({
          ...initialState,
          [TASK_AUDIT_LOG_FEATURE_KEY]: {
            ...initialTaskAuditLogState,
            loading: false,
            lastPage: true,
            latest: LATEST
          }
        });
      });

      it('does not fetch another batch', () => {
        expect(store.dispatch).not.toHaveBeenCalledWith(
          loadTaskAuditLogEntries({ latest: LATEST })
        );
      });
    });
  });

  describe('selecting a row', () => {
    describe('when it is a new row', () => {
      beforeEach(() => {
        component.currentEntry = null;
        component.onEntrySelected(ENTRY);
      });

      it('sets the current row', () => {
        expect(component.currentEntry).toEqual(ENTRY);
      });
    });

    describe('when it is a different row', () => {
      const OTHER_ENTRY = TASK_AUDIT_LOG_ENTRY_2;

      beforeEach(() => {
        component.currentEntry = ENTRY;
        component.onEntrySelected(OTHER_ENTRY);
      });

      it('updates the current row', () => {
        expect(component.currentEntry).toEqual(OTHER_ENTRY);
      });
    });

    describe('when it is the same row', () => {
      beforeEach(() => {
        component.currentEntry = ENTRY;
        component.onEntrySelected(ENTRY);
      });

      it('clears the current row', () => {
        expect(component.currentEntry).toBeNull();
      });
    });
  });

  describe('converting the description to JSON', () => {
    describe('when not null', () => {
      const SOURCE = { name1: 'value1', name2: 'value2' };

      it('converts  a string to JSON', () => {
        expect(component.toJSON(JSON.stringify(SOURCE))).toEqual(SOURCE);
      });
    });

    describe('when null', () => {
      it('returns an empty vaue', () => {
        expect(component.toJSON(null)).toEqual({});
      });
    });
  });

  describe('sorting data', () => {
    it('can sort by task type', () => {
      expect(
        component.dataSource.sortingDataAccessor(ENTRY, 'task-type')
      ).toEqual(ENTRY.taskType);
    });

    it('can sort by start tim', () => {
      expect(
        component.dataSource.sortingDataAccessor(ENTRY, 'start-time')
      ).toEqual(ENTRY.startTime);
    });

    it('can sort by runtime', () => {
      expect(
        component.dataSource.sortingDataAccessor(ENTRY, 'runtime')
      ).toEqual(ENTRY.endTime - ENTRY.startTime);
    });

    it('can sort by success', () => {
      expect(
        component.dataSource.sortingDataAccessor(ENTRY, 'successful')
      ).toEqual(`${ENTRY.successful}`);
    });
  });
});
