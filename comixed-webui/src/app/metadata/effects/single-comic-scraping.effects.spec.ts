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
import { SingleComicScrapingEffects } from './single-comic-scraping.effects';
import { expect, vi } from 'vitest';
import {
  METADATA_SOURCE_1,
  SCRAPING_ISSUE_1,
  SCRAPING_VOLUME_1,
  SCRAPING_VOLUME_2
} from '@app/metadata/metadata-fixtures';
import { SingleComicScrapingActions } from '@app/metadata/actions/single-comic-scraping.actions';
import { ComicScrapingService } from '@app/metadata/services/comic-scraping-service';
import { AlertService } from '@app/services/alert-service';
import { HttpErrorResponse } from '@angular/common/http';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { MessageService } from '@openng/optimus-ui/api';
import { provideTranslateService } from '@ngx-translate/core';
import { COMIC_1 } from '@app/library/library-fixtures';

describe('SingleComicScrapingEffects', () => {
  const TEST_PUBLISHER = 'The Publisher';
  const TEST_SERIES = 'The Series';
  const TEST_MATCH_PUBLISHER = Math.random() > 0.5;
  const TEST_SKIP_CACHE = Math.random() > 0.5;
  const TEST_MAX_RECORDS = 0;
  const TEST_METADATA_SOURCE = METADATA_SOURCE_1;
  const TEST_SCRAPING_VOLUME_LIST = [SCRAPING_VOLUME_1, SCRAPING_VOLUME_2];
  const TEST_SCRAPING_ISSUE = SCRAPING_ISSUE_1;
  const TEST_ISSUE_NUMBER = '129';
  const TEST_ISSUE_ID = TEST_SCRAPING_ISSUE.id;
  const TEST_COMIC = COMIC_1;

  let actions$: Observable<unknown>;
  let effects: SingleComicScrapingEffects;
  let comicScrapingService: ComicScrapingService;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SingleComicScrapingEffects,
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideTranslateService(),
        provideMockActions(() => actions$),
        ComicScrapingService,
        AlertService,
        MessageService
      ]
    });

    effects = TestBed.inject(SingleComicScrapingEffects);
    comicScrapingService = TestBed.inject(ComicScrapingService);
    alertService = TestBed.inject(AlertService);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading scraping volumes', () => {
    it('should dispatch an action on success', async () => {
      const serviceResponse = TEST_SCRAPING_VOLUME_LIST;
      const action = SingleComicScrapingActions.loadVolumes({
        metadataSource: TEST_METADATA_SOURCE,
        publisher: TEST_PUBLISHER,
        series: TEST_SERIES,
        matchPublisher: TEST_MATCH_PUBLISHER,
        maximumRecords: TEST_MAX_RECORDS,
        skipCache: TEST_SKIP_CACHE
      });
      const outcome = SingleComicScrapingActions.loadVolumesSuccess({
        volumes: TEST_SCRAPING_VOLUME_LIST
      });

      const loadSpy = vi
        .spyOn(comicScrapingService, 'loadVolumes')
        .mockReturnValue(of(serviceResponse));

      actions$ = of(action);
      await expect(firstValueFrom(effects.loadVolumes$)).resolves.toEqual(
        outcome
      );
      expect(loadSpy).toHaveBeenCalled();
    });

    it('should dispatch an action on service failure', async () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = SingleComicScrapingActions.loadVolumes({
        metadataSource: TEST_METADATA_SOURCE,
        publisher: TEST_PUBLISHER,
        series: TEST_SERIES,
        matchPublisher: TEST_MATCH_PUBLISHER,
        maximumRecords: TEST_MAX_RECORDS,
        skipCache: TEST_SKIP_CACHE
      });
      const outcome = SingleComicScrapingActions.loadVolumesFailure();

      const loadSpy = vi
        .spyOn(comicScrapingService, 'loadVolumes')
        .mockReturnValue(throwError(() => serviceResponse));
      const errorSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.loadVolumes$)).resolves.toEqual(
        outcome
      );
      expect(loadSpy).toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalled();
    });

    it('should dispatch an action on general failure', async () => {
      const action = SingleComicScrapingActions.loadVolumes({
        metadataSource: TEST_METADATA_SOURCE,
        publisher: TEST_PUBLISHER,
        series: TEST_SERIES,
        matchPublisher: TEST_MATCH_PUBLISHER,
        maximumRecords: TEST_MAX_RECORDS,
        skipCache: TEST_SKIP_CACHE
      });
      const outcome = SingleComicScrapingActions.loadVolumesFailure();

      const loadSpy = vi
        .spyOn(comicScrapingService, 'loadVolumes')
        .mockThrow(new Error('Expected'));
      const errorSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.loadVolumes$)).resolves.toEqual(
        outcome
      );
      expect(loadSpy).toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('loading a scraping issue', () => {
    it('should dispatch an action on success', async () => {
      const serviceResponse = TEST_SCRAPING_ISSUE;
      const action = SingleComicScrapingActions.loadIssue({
        metadataSource: TEST_METADATA_SOURCE,
        volumeId: TEST_SCRAPING_VOLUME_LIST[0].id,
        issueNumber: TEST_ISSUE_NUMBER,
        skipCache: TEST_SKIP_CACHE
      });
      const outcome = SingleComicScrapingActions.loadIssueSuccess({
        issue: TEST_SCRAPING_ISSUE
      });

      const loadSpy = vi
        .spyOn(comicScrapingService, 'loadIssue')
        .mockReturnValue(of(serviceResponse));

      actions$ = of(action);
      await expect(firstValueFrom(effects.loadIssue$)).resolves.toEqual(
        outcome
      );
      expect(loadSpy).toHaveBeenCalledWith({
        metadataSource: TEST_METADATA_SOURCE,
        volumeId: TEST_SCRAPING_VOLUME_LIST[0].id,
        issueNumber: TEST_ISSUE_NUMBER,
        skipCache: TEST_SKIP_CACHE
      });
    });

    it('should dispatch an action on service failure', async () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = SingleComicScrapingActions.loadIssue({
        metadataSource: TEST_METADATA_SOURCE,
        volumeId: TEST_SCRAPING_VOLUME_LIST[0].id,
        issueNumber: TEST_ISSUE_NUMBER,
        skipCache: TEST_SKIP_CACHE
      });
      const outcome = SingleComicScrapingActions.loadIssueFailure();

      const loadSpy = vi
        .spyOn(comicScrapingService, 'loadIssue')
        .mockReturnValue(throwError(() => serviceResponse));
      const errorSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.loadIssue$)).resolves.toEqual(
        outcome
      );
      expect(loadSpy).toHaveBeenCalledWith({
        metadataSource: TEST_METADATA_SOURCE,
        volumeId: TEST_SCRAPING_VOLUME_LIST[0].id,
        issueNumber: TEST_ISSUE_NUMBER,
        skipCache: TEST_SKIP_CACHE
      });
      expect(errorSpy).toHaveBeenCalled();
    });

    it('should dispatch an action on general failure', async () => {
      const action = SingleComicScrapingActions.loadIssue({
        metadataSource: TEST_METADATA_SOURCE,
        volumeId: TEST_SCRAPING_VOLUME_LIST[0].id,
        issueNumber: TEST_ISSUE_NUMBER,
        skipCache: TEST_SKIP_CACHE
      });
      const outcome = SingleComicScrapingActions.loadIssueFailure();

      const loadSpy = vi
        .spyOn(comicScrapingService, 'loadIssue')
        .mockThrow(new Error('Expected'));
      const errorSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.loadIssue$)).resolves.toEqual(
        outcome
      );
      expect(loadSpy).toHaveBeenCalledWith({
        metadataSource: TEST_METADATA_SOURCE,
        volumeId: TEST_SCRAPING_VOLUME_LIST[0].id,
        issueNumber: TEST_ISSUE_NUMBER,
        skipCache: TEST_SKIP_CACHE
      });
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('scraping a single comic', () => {
    it('should dispatch an action on success', async () => {
      const action = SingleComicScrapingActions.scrapeComic({
        metadataSource: TEST_METADATA_SOURCE,
        issueId: TEST_ISSUE_ID,
        comic: TEST_COMIC,
        skipCache: TEST_SKIP_CACHE
      });
      const outcome = SingleComicScrapingActions.scrapeComicSuccess();

      const loadSpy = vi
        .spyOn(comicScrapingService, 'scrapeIssue')
        .mockReturnValue(of(undefined));

      actions$ = of(action);
      await expect(firstValueFrom(effects.scrapeComic$)).resolves.toEqual(
        outcome
      );
      expect(loadSpy).toHaveBeenCalledWith({
        metadataSource: TEST_METADATA_SOURCE,
        issueId: TEST_ISSUE_ID,
        comic: TEST_COMIC,
        skipCache: TEST_SKIP_CACHE
      });
    });

    it('should dispatch an action on service failure', async () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = SingleComicScrapingActions.scrapeComic({
        metadataSource: TEST_METADATA_SOURCE,
        issueId: TEST_ISSUE_ID,
        comic: TEST_COMIC,
        skipCache: TEST_SKIP_CACHE
      });
      const outcome = SingleComicScrapingActions.scrapeComicFailure();

      const loadSpy = vi
        .spyOn(comicScrapingService, 'scrapeIssue')
        .mockReturnValue(throwError(() => serviceResponse));
      const errorSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.scrapeComic$)).resolves.toEqual(
        outcome
      );
      expect(loadSpy).toHaveBeenCalledWith({
        metadataSource: TEST_METADATA_SOURCE,
        issueId: TEST_ISSUE_ID,
        comic: TEST_COMIC,
        skipCache: TEST_SKIP_CACHE
      });
      expect(errorSpy).toHaveBeenCalled();
    });

    it('should dispatch an action on general failure', async () => {
      const action = SingleComicScrapingActions.scrapeComic({
        metadataSource: TEST_METADATA_SOURCE,
        issueId: TEST_ISSUE_ID,
        comic: TEST_COMIC,
        skipCache: TEST_SKIP_CACHE
      });
      const outcome = SingleComicScrapingActions.scrapeComicFailure();

      const loadSpy = vi
        .spyOn(comicScrapingService, 'scrapeIssue')
        .mockThrow(new Error('Expected'));
      const errorSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.scrapeComic$)).resolves.toEqual(
        outcome
      );
      expect(loadSpy).toHaveBeenCalledWith({
        metadataSource: TEST_METADATA_SOURCE,
        issueId: TEST_ISSUE_ID,
        comic: TEST_COMIC,
        skipCache: TEST_SKIP_CACHE
      });
      expect(errorSpy).toHaveBeenCalled();
    });
  });
});
