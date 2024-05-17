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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BatchProcessListPageComponent } from './batch-process-list-page.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import {
  BATCH_PROCESSES_FEATURE_KEY,
  initialState as batchProcessInitialState
} from '@app/admin/reducers/batch-processes.reducer';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BATCH_PROCESS_DETAIL_1 } from '@app/admin/admin.fixtures';
import { TitleService } from '@app/core/services/title.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { deleteCompletedBatchJobs } from '@app/admin/actions/batch-processes.actions';
import { MatListModule } from '@angular/material/list';
import {
  initialState as initialMessagingState,
  MESSAGING_FEATURE_KEY
} from '@app/messaging/reducers/messaging.reducer';
import {
  Confirmation,
  ConfirmationService
} from '@tragically-slick/confirmation';
import { MatDialogModule } from '@angular/material/dialog';

describe('BatchProcessListPageComponent', () => {
  const DETAIL = BATCH_PROCESS_DETAIL_1;
  const initialState = {
    [BATCH_PROCESSES_FEATURE_KEY]: batchProcessInitialState,
    [MESSAGING_FEATURE_KEY]: initialMessagingState
  };

  let component: BatchProcessListPageComponent;
  let fixture: ComponentFixture<BatchProcessListPageComponent>;
  let store: MockStore;
  let translateService: TranslateService;
  let titleService: TitleService;
  let confirmationService: ConfirmationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BatchProcessListPageComponent],
      imports: [
        NoopAnimationsModule,
        RouterTestingModule.withRoutes([{ path: '*', redirectTo: '' }]),
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatTooltipModule,
        MatPaginatorModule,
        MatTableModule,
        MatSortModule,
        MatDialogModule,
        MatListModule
      ],
      providers: [provideMockStore({ initialState }), ConfirmationService]
    }).compileComponents();

    fixture = TestBed.createComponent(BatchProcessListPageComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    translateService = TestBed.inject(TranslateService);
    titleService = TestBed.inject(TitleService);
    spyOn(titleService, 'setTitle');
    confirmationService = TestBed.inject(ConfirmationService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('sorting', () => {
    it('can sort by name', () => {
      expect(
        component.dataSource.sortingDataAccessor(DETAIL, 'job-name')
      ).toEqual(DETAIL.jobName);
    });

    it('can sort by job id', () => {
      expect(
        component.dataSource.sortingDataAccessor(DETAIL, 'job-id')
      ).toEqual(DETAIL.jobId);
    });

    it('can sort by status', () => {
      expect(
        component.dataSource.sortingDataAccessor(DETAIL, 'status')
      ).toEqual(DETAIL.status);
    });

    it('can sort by start time', () => {
      expect(
        component.dataSource.sortingDataAccessor(DETAIL, 'start-time')
      ).toEqual(DETAIL.startTime);
    });

    it('can sort by end time', () => {
      expect(
        component.dataSource.sortingDataAccessor(DETAIL, 'end-time')
      ).toEqual(DETAIL.endTime);
    });

    it('can sort by exit code', () => {
      expect(
        component.dataSource.sortingDataAccessor(DETAIL, 'exit-code')
      ).toEqual(DETAIL.exitStatus);
    });

    it('returns null on an unknown column', () => {
      expect(
        component.dataSource.sortingDataAccessor(DETAIL, 'farkle')
      ).toBeNull();
    });
  });

  describe('language change', () => {
    beforeEach(() => {
      translateService.use('fr');
    });

    it('updates the tab title', () => {
      expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('deleting completed batch jobs', () => {
    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.onDeleteCompletedBatchJobs();
    });

    it('prompts the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(deleteCompletedBatchJobs());
    });
  });
});
