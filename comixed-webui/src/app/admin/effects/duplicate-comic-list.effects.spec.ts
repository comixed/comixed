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
import { DuplicateComicListEffects } from './duplicate-comic-list.effects';
import { LoadDuplicateComicListResponse } from '@app/library/models/net/load-duplicate-comic-list-response';
import { DuplicateComicListActions } from '@app/admin/actions/duplicate-comic-list.actions';
import { expect, vi } from 'vitest';
import { DuplicateComicService } from '@app/admin/services/duplicate-comic-service';
import { AlertService } from '@app/services/alert-service';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { MessageService } from '@openng/optimus-ui/api';
import { provideTranslateService } from '@ngx-translate/core';
import {
  DUPLICATE_COMIC_1,
  DUPLICATE_COMIC_2
} from '@app/admin/admin-fixtures';

describe('DuplicateComicListEffects', () => {
  const TEST_DUPLICATE_COMIC_LIST = [DUPLICATE_COMIC_1, DUPLICATE_COMIC_2];
  const TEST_TOTAL = 921;
  const TEST_PAGE = 3;
  const TEST_SIZE = 25;
  const TEST_SORT_BY = 'volume';
  const TEST_SORT_DIRECTION = 'asc';

  let actions$: Observable<unknown>;
  let effects: DuplicateComicListEffects;
  let duplicateComicService: DuplicateComicService;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DuplicateComicListEffects,
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideTranslateService(),
        provideMockActions(() => actions$),
        AlertService,
        MessageService
      ]
    });

    effects = TestBed.inject(DuplicateComicListEffects);
    duplicateComicService = TestBed.inject(DuplicateComicService);
    alertService = TestBed.inject(AlertService);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading the list of duplicate comics', () => {
    it('should dispatch an action on success', async () => {
      const serviceResponse = {
        comics: TEST_DUPLICATE_COMIC_LIST,
        totalCount: TEST_TOTAL
      } as LoadDuplicateComicListResponse;
      const action = DuplicateComicListActions.load({
        index: TEST_PAGE,
        size: TEST_SIZE,
        sortBy: TEST_SORT_BY,
        sortDirection: TEST_SORT_DIRECTION
      });
      const outcome = DuplicateComicListActions.loadSuccess({
        entries: TEST_DUPLICATE_COMIC_LIST,
        total: TEST_TOTAL
      });

      const loadSpy = vi
        .spyOn(duplicateComicService, 'loadAll')
        .mockReturnValue(of(serviceResponse));

      actions$ = of(action);
      await expect(firstValueFrom(effects.load$)).resolves.toEqual(outcome);
      expect(loadSpy).toHaveBeenCalledWith({
        index: TEST_PAGE,
        size: TEST_SIZE,
        sortBy: TEST_SORT_BY,
        sortDirection: TEST_SORT_DIRECTION
      });
    });

    it('should dispatch an action on service failure', async () => {
      const serviceResponse = {
        comics: TEST_DUPLICATE_COMIC_LIST,
        totalCount: TEST_TOTAL
      } as LoadDuplicateComicListResponse;
      const action = DuplicateComicListActions.load({
        index: TEST_PAGE,
        size: TEST_SIZE,
        sortBy: TEST_SORT_BY,
        sortDirection: TEST_SORT_DIRECTION
      });
      const outcome = DuplicateComicListActions.loadFailure();

      const loadSpy = vi
        .spyOn(duplicateComicService, 'loadAll')
        .mockReturnValue(throwError(() => serviceResponse));
      const errorSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.load$)).resolves.toEqual(outcome);
      expect(loadSpy).toHaveBeenCalledWith({
        index: TEST_PAGE,
        size: TEST_SIZE,
        sortBy: TEST_SORT_BY,
        sortDirection: TEST_SORT_DIRECTION
      });
      expect(errorSpy).toHaveBeenCalled();
    });

    it('should dispatch an action on general failure', async () => {
      const action = DuplicateComicListActions.load({
        index: TEST_PAGE,
        size: TEST_SIZE,
        sortBy: TEST_SORT_BY,
        sortDirection: TEST_SORT_DIRECTION
      });
      const outcome = DuplicateComicListActions.loadFailure();

      const loadSpy = vi
        .spyOn(duplicateComicService, 'loadAll')
        .mockThrow(new Error('Expected'));
      const errorSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.load$)).resolves.toEqual(outcome);
      expect(loadSpy).toHaveBeenCalledWith({
        index: TEST_PAGE,
        size: TEST_SIZE,
        sortBy: TEST_SORT_BY,
        sortDirection: TEST_SORT_DIRECTION
      });
      expect(errorSpy).toHaveBeenCalled();
    });
  });
});
