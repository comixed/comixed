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
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { provideTranslateService } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import {
  initialUserState,
  USER_FEATURE_KEY
} from '@app/account/reducers/user.reducer';
import {
  initialRemoteLibraryState,
  REMOTE_LIBRARY_FEATURE_KEY
} from '@app/library/reducers/remote-library.reducer';
import { LibraryStatisticsPanel } from '@app/layout/components/library-statistics-panel/library-statistics-panel';
import {
  BATCH_PROCESS_LIST_FEATURE_KEY,
  initialBatchProcessListState
} from '@app/batch/reducers/batch-process-list.reducer';
import {
  initialSelectedComicListState,
  SELECTED_COMIC_LIST_FEATURE_KEY
} from '@app/library/reducers/selected-comic-list.reducer';

describe('LibraryStatisticsPanel', () => {
  const initialState = {
    [REMOTE_LIBRARY_FEATURE_KEY]: initialRemoteLibraryState,
    [USER_FEATURE_KEY]: initialUserState,
    [SELECTED_COMIC_LIST_FEATURE_KEY]: initialSelectedComicListState,
    [BATCH_PROCESS_LIST_FEATURE_KEY]: initialBatchProcessListState
  };

  let component: LibraryStatisticsPanel;
  let fixture: ComponentFixture<LibraryStatisticsPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LibraryStatisticsPanel],
      providers: [
        provideRouter([{ path: '*', redirectTo: '' }]),
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideTranslateService(),
        provideMockStore({ initialState })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LibraryStatisticsPanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
