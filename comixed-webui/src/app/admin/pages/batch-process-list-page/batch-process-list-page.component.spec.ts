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
import { BATCH_PROCESS_STATUS_1 } from '@app/admin/admin.fixtures';
import { TitleService } from '@app/core/services/title.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('BatchProcessListPageComponent', () => {
  const PROCESS = BATCH_PROCESS_STATUS_1;
  const initialState = {
    [BATCH_PROCESSES_FEATURE_KEY]: batchProcessInitialState
  };

  let component: BatchProcessListPageComponent;
  let fixture: ComponentFixture<BatchProcessListPageComponent>;
  let store: MockStore;
  let translateService: TranslateService;
  let titleService: TitleService;

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
        MatSortModule
      ],
      providers: [provideMockStore({ initialState })]
    }).compileComponents();

    fixture = TestBed.createComponent(BatchProcessListPageComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    translateService = TestBed.inject(TranslateService);
    titleService = TestBed.inject(TitleService);
    spyOn(titleService, 'setTitle');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('sorting', () => {
    it('can sort by name', () => {
      expect(component.dataSource.sortingDataAccessor(PROCESS, 'name')).toEqual(
        PROCESS.name
      );
    });

    it('can sort by job id', () => {
      expect(
        component.dataSource.sortingDataAccessor(PROCESS, 'job-id')
      ).toEqual(PROCESS.jobId);
    });

    it('can sort by status', () => {
      expect(
        component.dataSource.sortingDataAccessor(PROCESS, 'status')
      ).toEqual(PROCESS.status);
    });

    it('can sort by start time', () => {
      expect(
        component.dataSource.sortingDataAccessor(PROCESS, 'start-time')
      ).toEqual(PROCESS.startTime);
    });

    it('can sort by end time', () => {
      expect(
        component.dataSource.sortingDataAccessor(PROCESS, 'end-time')
      ).toEqual(PROCESS.endTime);
    });

    it('can sort by exit code', () => {
      expect(
        component.dataSource.sortingDataAccessor(PROCESS, 'exit-code')
      ).toEqual(PROCESS.exitCode);
    });

    it('returns null on an unknown column', () => {
      expect(
        component.dataSource.sortingDataAccessor(PROCESS, 'farkle')
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
});
