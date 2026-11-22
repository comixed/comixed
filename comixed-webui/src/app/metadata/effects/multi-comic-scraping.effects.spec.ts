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
import { firstValueFrom, Observable, of, throwError, toArray } from 'rxjs';
import { MultiComicScrapingEffects } from './multi-comic-scraping.effects';
import { expect, vi } from 'vitest';
import { StartMultiComicScrapingResponse } from '@app/metadata/models/net/start-multi-comic-scraping-response';
import { MultiComicScrapingActions } from '@app/metadata/actions/multi-comic-scraping.actions';
import { COMIC_1, COMIC_2 } from '@app/library/library-fixtures';
import { ComicScrapingService } from '@app/metadata/services/comic-scraping-service';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { MessageService } from '@openng/optimus-ui/api';
import { AlertService } from '@app/services/alert-service';
import { provideTranslateService } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { RemoveMultiComicScrapingResponse } from '@app/metadata/models/net/remove-multi-comic-scraping-response';
import { ScrapeMultiComicEntryResponse } from '@app/metadata/models/net/scrape-multi-comic-entry-response';
import {
  METADATA_SOURCE_1,
  SCRAPING_ISSUE_1
} from '@app/metadata/metadata-fixtures';
import { SingleComicScrapingActions } from '@app/metadata/actions/single-comic-scraping.actions';

describe('MultiComicScrapingEffects', () => {
  const TEST_COMIC_LIST = [COMIC_1, COMIC_2];
  const TEST_COMIC = COMIC_1;
  const TEST_TOTAL = 501;
  const TEST_INDEX = 1;
  const TEST_SIZE = 10;
  const TEST_METADATA_SOURCE = METADATA_SOURCE_1;
  const TEST_SCRAPING_ISSUE = SCRAPING_ISSUE_1;
  const TEST_SKIP_CACHE = Math.random() > 0.5;

  let actions$: Observable<unknown>;
  let effects: MultiComicScrapingEffects;
  let comicScrapingService: ComicScrapingService;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MultiComicScrapingEffects,
        provideRouter([
          {
            path: 'admin/library/scraping/multi',
            redirectTo: ''
          }
        ]),
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideTranslateService(),
        provideMockActions(() => actions$),
        MessageService,
        AlertService
      ]
    });

    effects = TestBed.inject(MultiComicScrapingEffects);
    comicScrapingService = TestBed.inject(ComicScrapingService);
    alertService = TestBed.inject(AlertService);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('starting multi-comic scraping', () => {
    it('should fire an action on success', async () => {
      const serviceResponse = {
        comics: TEST_COMIC_LIST,
        totalComics: TEST_TOTAL,
        pageNumber: TEST_INDEX,
        pageSize: TEST_SIZE
      } as StartMultiComicScrapingResponse;
      const action = MultiComicScrapingActions.startScraping({
        size: TEST_SIZE
      });
      const outcome = MultiComicScrapingActions.startScrapingSuccess({
        entries: TEST_COMIC_LIST,
        total: TEST_TOTAL,
        index: TEST_INDEX,
        size: TEST_SIZE
      });

      const startSpy = vi
        .spyOn(comicScrapingService, 'startMultiComicScraping')
        .mockReturnValue(of(serviceResponse));

      actions$ = of(action);
      await expect(firstValueFrom(effects.startScraping$)).resolves.toEqual(
        outcome
      );
      expect(startSpy).toHaveBeenCalled();
    });

    it('should fire an action on service failure', async () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = MultiComicScrapingActions.startScraping({
        size: TEST_SIZE
      });
      const outcome = MultiComicScrapingActions.startScrapingFailure();

      const startSpy = vi
        .spyOn(comicScrapingService, 'startMultiComicScraping')
        .mockReturnValue(throwError(() => serviceResponse));
      const errorSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.startScraping$)).resolves.toEqual(
        outcome
      );
      expect(startSpy).toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalled();
    });

    it('should fire an action on general failure', async () => {
      const action = MultiComicScrapingActions.startScraping({
        size: TEST_SIZE
      });
      const outcome = MultiComicScrapingActions.startScrapingFailure();

      const startSpy = vi
        .spyOn(comicScrapingService, 'startMultiComicScraping')
        .mockThrow(new Error('Expected'));
      const errorSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.startScraping$)).resolves.toEqual(
        outcome
      );
      expect(startSpy).toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('loading comics', () => {
    it('should fire an action on success', async () => {
      const serviceResponse = {
        comics: TEST_COMIC_LIST,
        totalComics: TEST_TOTAL,
        pageNumber: TEST_INDEX,
        pageSize: TEST_SIZE
      } as StartMultiComicScrapingResponse;
      const action = MultiComicScrapingActions.loadComics({
        index: TEST_INDEX,
        size: TEST_SIZE
      });
      const outcome = MultiComicScrapingActions.loadComicsSuccess({
        entries: TEST_COMIC_LIST,
        total: TEST_TOTAL,
        index: TEST_INDEX,
        size: TEST_SIZE
      });

      const startSpy = vi
        .spyOn(comicScrapingService, 'loadMultiComicScraping')
        .mockReturnValue(of(serviceResponse));

      actions$ = of(action);
      await expect(firstValueFrom(effects.loadComics$)).resolves.toEqual(
        outcome
      );
      expect(startSpy).toHaveBeenCalled();
    });

    it('should fire an action on service failure', async () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = MultiComicScrapingActions.loadComics({
        index: TEST_INDEX,
        size: TEST_SIZE
      });
      const outcome = MultiComicScrapingActions.loadComicsFailure();

      const startSpy = vi
        .spyOn(comicScrapingService, 'loadMultiComicScraping')
        .mockReturnValue(throwError(() => serviceResponse));
      const errorSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.loadComics$)).resolves.toEqual(
        outcome
      );
      expect(startSpy).toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalled();
    });

    it('should fire an action on general failure', async () => {
      const action = MultiComicScrapingActions.loadComics({
        index: TEST_INDEX,
        size: TEST_SIZE
      });
      const outcome = MultiComicScrapingActions.loadComicsFailure();

      const startSpy = vi
        .spyOn(comicScrapingService, 'loadMultiComicScraping')
        .mockThrow(new Error('Expected'));
      const errorSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.loadComics$)).resolves.toEqual(
        outcome
      );
      expect(startSpy).toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('removing a comic', () => {
    it('should fire an action on success', async () => {
      const serviceResponse = {
        comics: TEST_COMIC_LIST,
        totalComics: TEST_TOTAL,
        pageNumber: TEST_INDEX,
        pageSize: TEST_SIZE
      } as RemoveMultiComicScrapingResponse;
      const action = MultiComicScrapingActions.removeComic({
        entry: TEST_COMIC
      });
      const outcome = MultiComicScrapingActions.removeComicSuccess({
        entries: TEST_COMIC_LIST,
        total: TEST_TOTAL,
        index: TEST_INDEX,
        size: TEST_SIZE
      });

      const removeSpy = vi
        .spyOn(comicScrapingService, 'removeMultiComicScraping')
        .mockReturnValue(of(serviceResponse));
      const infoSpy = vi.spyOn(alertService, 'info');
      actions$ = of(action);
      await expect(firstValueFrom(effects.removeComic$)).resolves.toEqual(
        outcome
      );
      expect(removeSpy).toHaveBeenCalled();
      expect(infoSpy).toHaveBeenCalled();
    });

    it('should fire an action on service failure', async () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = MultiComicScrapingActions.removeComic({
        entry: TEST_COMIC
      });
      const outcome = MultiComicScrapingActions.removeComicFailure();

      const removeSpy = vi
        .spyOn(comicScrapingService, 'removeMultiComicScraping')
        .mockReturnValue(throwError(() => serviceResponse));
      const errorSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.removeComic$)).resolves.toEqual(
        outcome
      );
      expect(removeSpy).toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalled();
    });

    it('should fire an action on general failure', async () => {
      const action = MultiComicScrapingActions.removeComic({
        entry: TEST_COMIC
      });
      const outcome = MultiComicScrapingActions.removeComicFailure();

      const removeSpy = vi
        .spyOn(comicScrapingService, 'removeMultiComicScraping')
        .mockThrow(new Error('Expected'));
      const errorSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.removeComic$)).resolves.toEqual(
        outcome
      );
      expect(removeSpy).toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('scraping a comic', () => {
    it('should fire an action on success', async () => {
      const serviceResponse = {
        comics: TEST_COMIC_LIST,
        totalComics: TEST_TOTAL,
        pageNumber: TEST_INDEX,
        pageSize: TEST_SIZE
      } as ScrapeMultiComicEntryResponse;
      const action = MultiComicScrapingActions.scrapeComic({
        comic: TEST_COMIC,
        metadataSource: TEST_METADATA_SOURCE,
        issueId: TEST_SCRAPING_ISSUE.id,
        skipCache: TEST_SKIP_CACHE,
        index: TEST_INDEX,
        size: TEST_SIZE
      });
      const outcome1 = MultiComicScrapingActions.scrapeComicSuccess({
        entries: TEST_COMIC_LIST,
        total: TEST_TOTAL,
        index: TEST_INDEX,
        size: TEST_SIZE
      });
      const outcome2 = SingleComicScrapingActions.resetVolumes();

      const scrapeSpy = vi
        .spyOn(comicScrapingService, 'scrapeMultiComicEntry')
        .mockReturnValue(of(serviceResponse));
      actions$ = of(action);
      await expect(
        firstValueFrom(effects.scrapeComic$.pipe(toArray()))
      ).resolves.toStrictEqual([outcome1, outcome2]);
      expect(scrapeSpy).toHaveBeenCalled();
    });

    it('should fire an action on service failure', async () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = MultiComicScrapingActions.scrapeComic({
        comic: TEST_COMIC,
        metadataSource: TEST_METADATA_SOURCE,
        issueId: TEST_SCRAPING_ISSUE.id,
        skipCache: TEST_SKIP_CACHE,
        index: TEST_INDEX,
        size: TEST_SIZE
      });
      const outcome = MultiComicScrapingActions.scrapeComicFailure();

      const scrapeSpy = vi
        .spyOn(comicScrapingService, 'scrapeMultiComicEntry')
        .mockReturnValue(throwError(() => serviceResponse));
      const error = vi.spyOn(alertService, 'error');
      actions$ = of(action);
      await expect(firstValueFrom(effects.scrapeComic$)).resolves.toEqual(
        outcome
      );
      expect(scrapeSpy).toHaveBeenCalled();
      expect(error).toHaveBeenCalled();
    });

    it('should fire an action on general failure', async () => {
      const action = MultiComicScrapingActions.scrapeComic({
        comic: TEST_COMIC,
        metadataSource: TEST_METADATA_SOURCE,
        issueId: TEST_SCRAPING_ISSUE.id,
        skipCache: TEST_SKIP_CACHE,
        index: TEST_INDEX,
        size: TEST_SIZE
      });
      const outcome = MultiComicScrapingActions.scrapeComicFailure();

      const scrapeSpy = vi
        .spyOn(comicScrapingService, 'scrapeMultiComicEntry')
        .mockThrow(new Error('Expected'));
      const error = vi.spyOn(alertService, 'error');
      actions$ = of(action);
      await expect(firstValueFrom(effects.scrapeComic$)).resolves.toEqual(
        outcome
      );
      expect(scrapeSpy).toHaveBeenCalled();
      expect(error).toHaveBeenCalled();
    });
  });
});
