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

import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { firstValueFrom, Observable, of, throwError } from 'rxjs';
import { DuplicateComicEffects } from './duplicate-comic.effects';
import { expect, vi } from 'vitest';
import { DuplicateComicService } from '@app/admin/services/duplicate-comic-service';
import { AlertService } from '@app/services/alert-service';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { MessageService } from '@openng/optimus-ui/api';
import { provideTranslateService } from '@ngx-translate/core';
import { LoadDuplicateComicResponse } from '@app/library/models/net/load-duplicate-comic-response';
import { COMIC_1, COMIC_2 } from '@app/library/library-fixtures';
import { DuplicateComicActions } from '@app/admin/actions/duplicate-comic.actions';
import { HttpErrorResponse } from '@angular/common/http';

describe('DuplicateComicEffects', () => {
  const TEST_COMIC_LIST = [COMIC_1, COMIC_2];
  const TEST_INDEX = 17;
  const TEST_SIZE = 25;
  const TEST_SORT_BY = 'coverDate';
  const TEST_SORT_DIRECTION = 'asc';
  const TEST_COVER_MONTHS = [1, 3, 4, 7, 9, 12];
  const TEST_COVER_YEARS = [1965, 1971, 1986, 1996, 1998, 2006];
  const TEST_TOTAL = 61;
  const TEST_FILTER_COUNT = 55;
  const TEST_PUBLISHER = 'The Publisher';
  const TEST_SERIES = 'The Series';
  const TEST_VOLUME = '2026';
  const TEST_ISSUE_NUMBER = '717';
  const TEST_COVER_DATE = new Date().getTime();

  let actions$: Observable<unknown>;
  let effects: DuplicateComicEffects;
  let duplicateComicService: DuplicateComicService;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DuplicateComicEffects,
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideTranslateService(),
        provideMockActions(() => actions$),
        AlertService,
        MessageService
      ]
    });

    effects = TestBed.inject(DuplicateComicEffects);
    duplicateComicService = TestBed.inject(DuplicateComicService);
    alertService = TestBed.inject(AlertService);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading a duplicated comic', () => {
    it('should fire an action on success', async () => {
      const serviceResponse = {
        comics: TEST_COMIC_LIST,
        coverMonths: TEST_COVER_MONTHS,
        coverYears: TEST_COVER_YEARS,
        totalCount: TEST_TOTAL,
        filteredCount: TEST_FILTER_COUNT
      } as LoadDuplicateComicResponse;
      const action = DuplicateComicActions.load({
        publisher: TEST_PUBLISHER,
        series: TEST_SERIES,
        volume: TEST_VOLUME,
        issueNumber: TEST_ISSUE_NUMBER,
        coverDate: TEST_COVER_DATE,
        index: TEST_INDEX,
        size: TEST_SIZE,
        sortBy: TEST_SORT_BY,
        sortDirection: TEST_SORT_DIRECTION
      });
      const outcome = DuplicateComicActions.loadSuccess({
        entries: TEST_COMIC_LIST,
        coverMonths: TEST_COVER_MONTHS,
        coverYears: TEST_COVER_YEARS,
        total: TEST_TOTAL
      });

      const loadSpy = vi
        .spyOn(duplicateComicService, 'loadOne')
        .mockReturnValue(of(serviceResponse));

      actions$ = of(action);
      await expect(firstValueFrom(effects.load$)).resolves.toEqual(outcome);
      expect(loadSpy).toHaveBeenCalledWith({
        publisher: TEST_PUBLISHER,
        series: TEST_SERIES,
        volume: TEST_VOLUME,
        issueNumber: TEST_ISSUE_NUMBER,
        coverDate: TEST_COVER_DATE,
        index: TEST_INDEX,
        size: TEST_SIZE,
        sortBy: TEST_SORT_BY,
        sortDirection: TEST_SORT_DIRECTION
      });
    });

    it('should fire an action on service failure', async () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = DuplicateComicActions.load({
        publisher: TEST_PUBLISHER,
        series: TEST_SERIES,
        volume: TEST_VOLUME,
        issueNumber: TEST_ISSUE_NUMBER,
        coverDate: TEST_COVER_DATE,
        index: TEST_INDEX,
        size: TEST_SIZE,
        sortBy: TEST_SORT_BY,
        sortDirection: TEST_SORT_DIRECTION
      });
      const outcome = DuplicateComicActions.loadFailure();

      const loadSpy = vi
        .spyOn(duplicateComicService, 'loadOne')
        .mockReturnValue(throwError(() => serviceResponse));
      const errorSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.load$)).resolves.toEqual(outcome);
      expect(loadSpy).toHaveBeenCalledWith({
        publisher: TEST_PUBLISHER,
        series: TEST_SERIES,
        volume: TEST_VOLUME,
        issueNumber: TEST_ISSUE_NUMBER,
        coverDate: TEST_COVER_DATE,
        index: TEST_INDEX,
        size: TEST_SIZE,
        sortBy: TEST_SORT_BY,
        sortDirection: TEST_SORT_DIRECTION
      });
      expect(errorSpy).toHaveBeenCalled();
    });

    it('should fire an action on general failure', async () => {
      const action = DuplicateComicActions.load({
        publisher: TEST_PUBLISHER,
        series: TEST_SERIES,
        volume: TEST_VOLUME,
        issueNumber: TEST_ISSUE_NUMBER,
        coverDate: TEST_COVER_DATE,
        index: TEST_INDEX,
        size: TEST_SIZE,
        sortBy: TEST_SORT_BY,
        sortDirection: TEST_SORT_DIRECTION
      });
      const outcome = DuplicateComicActions.loadFailure();

      const loadSpy = vi
        .spyOn(duplicateComicService, 'loadOne')
        .mockThrow(new Error('Expected'));
      const errorSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.load$)).resolves.toEqual(outcome);
      expect(loadSpy).toHaveBeenCalledWith({
        publisher: TEST_PUBLISHER,
        series: TEST_SERIES,
        volume: TEST_VOLUME,
        issueNumber: TEST_ISSUE_NUMBER,
        coverDate: TEST_COVER_DATE,
        index: TEST_INDEX,
        size: TEST_SIZE,
        sortBy: TEST_SORT_BY,
        sortDirection: TEST_SORT_DIRECTION
      });
      expect(errorSpy).toHaveBeenCalled();
    });
  });
});
