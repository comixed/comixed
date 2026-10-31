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
import { ComicService } from '@app/library/services/comic-service';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { provideMockActions } from '@ngrx/effects/testing';
import { firstValueFrom, Observable, of, throwError } from 'rxjs';
import { LoadComicDetailResponse } from '@app/library/models/net/load-comic-detail-response';
import {
  COMIC_1,
  COMIC_PAGE_1,
  COMIC_TAG_1,
  METADATA_1
} from '@app/library/library-fixtures';
import { ComicDetailAction } from '@app/library/actions/comic-detail.actions';
import { MessageService } from '@openng/optimus-ui/api';
import { provideTranslateService } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { AlertService } from '@app/services/alert-service';
import { ComicDetailEffects } from '@app/library/effects/comic-detail.effects';
import { expect, it, vi } from 'vitest';

describe('ComicDetailEffects', () => {
  const TEST_COMIC = COMIC_1;
  const TEST_COMIC_ID = TEST_COMIC.comicId;
  const TEST_METADATA = METADATA_1;
  const TEST_PAGE_LIST = [COMIC_PAGE_1];
  const TEST_TAG_LIST = [COMIC_TAG_1];

  let actions$: Observable<unknown>;
  let effects: ComicDetailEffects;
  let comicService: ComicService;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ComicDetailEffects,
        provideMockActions(() => actions$),
        provideRouter([{ path: 'library/all', redirectTo: '' }]),
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideTranslateService(),
        AlertService,
        MessageService,
        ComicService
      ]
    });

    effects = TestBed.inject(ComicDetailEffects);
    comicService = TestBed.inject(ComicService);
    alertService = TestBed.inject(AlertService);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading a comic', () => {
    it('should dispatch an action on success', async () => {
      const serviceResponse = {
        detail: TEST_COMIC,
        pages: TEST_PAGE_LIST,
        tags: TEST_TAG_LIST,
        metadata: TEST_METADATA
      } as LoadComicDetailResponse;
      const action = ComicDetailAction.load({
        comicId: TEST_COMIC_ID
      });
      const outcome = ComicDetailAction.loadSuccess({
        comic: TEST_COMIC,
        pages: TEST_PAGE_LIST,
        tags: TEST_TAG_LIST,
        metadata: TEST_METADATA
      });

      const loadSpy = vi
        .spyOn(comicService, 'load')
        .mockReturnValue(of(serviceResponse));

      actions$ = of(action);
      await expect(firstValueFrom(effects.loadComic$)).resolves.toEqual(
        outcome
      );
      expect(loadSpy).toHaveBeenCalledWith({ comicId: TEST_COMIC_ID });
    });

    it('should dispatch an action on service failure', async () => {
      const serviceResponse = new Error('Service failure');
      const action = ComicDetailAction.load({
        comicId: TEST_COMIC_ID
      });
      const outcome = ComicDetailAction.loadFailure();

      const loadSpy = vi
        .spyOn(comicService, 'load')
        .mockReturnValue(throwError(() => serviceResponse));
      const alertSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.loadComic$)).resolves.toEqual(
        outcome
      );
      expect(loadSpy).toHaveBeenCalledWith({ comicId: TEST_COMIC_ID });
      expect(alertSpy).toHaveBeenCalled();
    });

    it('should dispatch an action on general failure', async () => {
      const action = ComicDetailAction.load({
        comicId: TEST_COMIC_ID
      });
      const outcome = ComicDetailAction.loadFailure();

      const loadSpy = vi
        .spyOn(comicService, 'load')
        .mockThrow(new Error('General failure'));
      const alertSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.loadComic$)).resolves.toEqual(
        outcome
      );
      expect(loadSpy).toHaveBeenCalledWith({ comicId: TEST_COMIC_ID });
      expect(alertSpy).toHaveBeenCalled();
    });
  });

  describe('saving a comic', () => {
    it('should dispatch an action on success', async () => {
      const serviceResponse = {
        detail: TEST_COMIC,
        pages: TEST_PAGE_LIST,
        tags: TEST_TAG_LIST,
        metadata: TEST_METADATA
      } as LoadComicDetailResponse;
      const action = ComicDetailAction.save({
        comic: TEST_COMIC
      });
      const outcome = ComicDetailAction.saveSuccess();

      const saveSpy = vi
        .spyOn(comicService, 'save')
        .mockReturnValue(of(serviceResponse));

      actions$ = of(action);
      await expect(firstValueFrom(effects.saveComic$)).resolves.toEqual(
        outcome
      );
      expect(saveSpy).toHaveBeenCalledWith({
        comicId: TEST_COMIC.comicId,
        comicType: TEST_COMIC.comicType,
        publisher: TEST_COMIC.publisher,
        series: TEST_COMIC.series,
        volume: TEST_COMIC.volume,
        issueNumber: TEST_COMIC.issueNumber,
        imprint: TEST_COMIC.imprint,
        sortName: TEST_COMIC.sortName,
        title: TEST_COMIC.title,
        coverDate: TEST_COMIC.coverDate,
        storeDate: TEST_COMIC.storeDate
      });
    });

    it('should dispatch an action on service failure', async () => {
      const serviceResponse = new Error('Service failure');
      const action = ComicDetailAction.save({
        comic: TEST_COMIC
      });
      const outcome = ComicDetailAction.saveFailure();

      const saveSpy = vi
        .spyOn(comicService, 'save')
        .mockReturnValue(throwError(() => serviceResponse));
      const alertSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.saveComic$)).resolves.toEqual(
        outcome
      );
      expect(saveSpy).toHaveBeenCalledWith({
        comicId: TEST_COMIC.comicId,
        comicType: TEST_COMIC.comicType,
        publisher: TEST_COMIC.publisher,
        series: TEST_COMIC.series,
        volume: TEST_COMIC.volume,
        issueNumber: TEST_COMIC.issueNumber,
        imprint: TEST_COMIC.imprint,
        sortName: TEST_COMIC.sortName,
        title: TEST_COMIC.title,
        coverDate: TEST_COMIC.coverDate,
        storeDate: TEST_COMIC.storeDate
      });
      expect(alertSpy).toHaveBeenCalled();
    });

    it('should dispatch an action on general failure', async () => {
      const action = ComicDetailAction.save({
        comic: TEST_COMIC
      });
      const outcome = ComicDetailAction.saveFailure();

      const saveSpy = vi
        .spyOn(comicService, 'save')
        .mockThrow(new Error('General failure'));
      const alertSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.saveComic$)).resolves.toEqual(
        outcome
      );
      expect(saveSpy).toHaveBeenCalledWith({
        comicId: TEST_COMIC.comicId,
        comicType: TEST_COMIC.comicType,
        publisher: TEST_COMIC.publisher,
        series: TEST_COMIC.series,
        volume: TEST_COMIC.volume,
        issueNumber: TEST_COMIC.issueNumber,
        imprint: TEST_COMIC.imprint,
        sortName: TEST_COMIC.sortName,
        title: TEST_COMIC.title,
        coverDate: TEST_COMIC.coverDate,
        storeDate: TEST_COMIC.storeDate
      });
      expect(alertSpy).toHaveBeenCalled();
    });
  });
});
