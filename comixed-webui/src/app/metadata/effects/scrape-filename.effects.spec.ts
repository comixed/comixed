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
import { ScrapeFilenameEffects } from './scrape-filename.effects';
import { ComicScrapingService } from '@app/metadata/services/comic-scraping-service';
import { AlertService } from '@app/services/alert-service';
import { expect, vi } from 'vitest';
import { HttpErrorResponse } from '@angular/common/http';
import { ScrapeFilenameResponse } from '@app/metadata/models/net/scrape-filename-response';
import { ScrapeFilenameActions } from '@app/metadata/actions/scrape-filename.actions';
import { COMIC_1 } from '@app/library/library-fixtures';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { provideTranslateService } from '@ngx-translate/core';
import { MessageService } from '@openng/optimus-ui/api';

describe('ScrapeFilenameEffects', () => {
  const TEST_COMIC = COMIC_1;
  const TEST_SERIES = 'The Series';
  const TEST_VOLUME = '2026';
  const TEST_ISSUE_NUMBER = '419';

  let actions$: Observable<unknown>;
  let effects: ScrapeFilenameEffects;
  let comicScrapingService: ComicScrapingService;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ScrapeFilenameEffects,
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideTranslateService(),
        provideMockActions(() => actions$),
        MessageService,
        AlertService
      ]
    });

    effects = TestBed.inject(ScrapeFilenameEffects);
    comicScrapingService = TestBed.inject(ComicScrapingService);
    alertService = TestBed.inject(AlertService);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('scraping the filename of a comic', () => {
    it('should dispatch an action on success', async () => {
      const serviceResponse = {
        found: true,
        series: TEST_SERIES,
        volume: TEST_VOLUME,
        issueNumber: TEST_ISSUE_NUMBER
      } as ScrapeFilenameResponse;
      const action = ScrapeFilenameActions.scrapeComic({ comic: TEST_COMIC });
      const outcome = ScrapeFilenameActions.scrapeComicSuccess({
        series: TEST_SERIES,
        volume: TEST_VOLUME,
        issueNumber: TEST_ISSUE_NUMBER
      });

      const loadSpy = vi
        .spyOn(comicScrapingService, 'scrapeFilename')
        .mockReturnValue(of(serviceResponse));

      actions$ = of(action);
      await expect(firstValueFrom(effects.scrapeComic$)).resolves.toEqual(
        outcome
      );
      expect(loadSpy).toHaveBeenCalled();
    });

    it('should dispatch an action on service failure', async () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = ScrapeFilenameActions.scrapeComic({ comic: TEST_COMIC });
      const outcome = ScrapeFilenameActions.scrapeComicFailure();

      const loadSpy = vi
        .spyOn(comicScrapingService, 'scrapeFilename')
        .mockReturnValue(throwError(() => serviceResponse));
      const errorSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.scrapeComic$)).resolves.toEqual(
        outcome
      );
      expect(loadSpy).toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalled();
    });

    it('should dispatch an action on general failure', async () => {
      const action = ScrapeFilenameActions.scrapeComic({ comic: TEST_COMIC });
      const outcome = ScrapeFilenameActions.scrapeComicFailure();

      const loadSpy = vi
        .spyOn(comicScrapingService, 'scrapeFilename')
        .mockThrow(new Error('Expected'));
      const errorSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.scrapeComic$)).resolves.toEqual(
        outcome
      );
      expect(loadSpy).toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalled();
    });
  });
});
