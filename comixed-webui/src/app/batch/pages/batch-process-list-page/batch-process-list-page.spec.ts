/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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
import { BatchProcessListPage } from './batch-process-list-page';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { provideMockStore } from '@ngrx/store/testing';
import {
  BATCH_PROCESS_LIST_FEATURE_KEY,
  batchProcessListAdaptor,
  initialBatchProcessListState
} from '@app/batch/reducers/batch-process-list.reducer';
import { provideTranslateService } from '@ngx-translate/core';
import { BATCH_PROCESS_1, BATCH_PROCESS_2 } from '@app/batch/batch-fixtures';

describe('BatchProcessListPage', () => {
  const TEST_BATCH_PROCESS_LIST = [BATCH_PROCESS_1, BATCH_PROCESS_2];
  const initialState = {
    [BATCH_PROCESS_LIST_FEATURE_KEY]: batchProcessListAdaptor.setAll(
      TEST_BATCH_PROCESS_LIST,
      { ...initialBatchProcessListState }
    )
  };

  let component: BatchProcessListPage;
  let fixture: ComponentFixture<BatchProcessListPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BatchProcessListPage],
      providers: [
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideTranslateService(),
        provideMockStore({ initialState })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BatchProcessListPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
