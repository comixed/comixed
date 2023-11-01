/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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
import { Observable, of, throwError } from 'rxjs';
import { MetadataEffects } from './metadata.effects';
import { MetadataService } from '@app/comic-metadata/services/metadata.service';
import { COMIC_BOOK_4 } from '@app/comic-books/comic-books.fixtures';
import {
  clearMetadataCache,
  clearMetadataCacheFailed,
  comicScraped,
  issueMetadataLoaded,
  loadIssueMetadata,
  loadIssueMetadataFailed,
  loadVolumeMetadata,
  loadVolumeMetadataFailed,
  metadataCacheCleared,
  scrapeComic,
  scrapeComicFailed,
  startMetadataUpdateProcess,
  startMetadataUpdateProcessFailure,
  startMetadataUpdateProcessSuccess,
  volumeMetadataLoaded
} from '@app/comic-metadata/actions/metadata.actions';
import { hot } from 'jasmine-marbles';
import { AlertService } from '@app/core/services/alert.service';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { comicBookLoaded } from '@app/comic-books/actions/comic-book.actions';
import {
  METADATA_SOURCE_1,
  SCRAPING_ISSUE_1,
  SCRAPING_VOLUME_1,
  SCRAPING_VOLUME_2,
  SCRAPING_VOLUME_3
} from '@app/comic-metadata/comic-metadata.fixtures';
import {
  clearComicBookSelectionState,
  removeSingleComicBookSelection
} from '@app/comic-books/actions/comic-book-selection.actions';

describe('MetadataEffects', () => {
  const SERIES = 'The Series';
  const MAXIMUM_RECORDS = 100;
  const SKIP_CACHE = Math.random() > 0.5;
  const VOLUMES = [SCRAPING_VOLUME_1, SCRAPING_VOLUME_2, SCRAPING_VOLUME_3];
  const SCRAPING_ISSUE = SCRAPING_ISSUE_1;
  const VOLUME_ID = SCRAPING_VOLUME_1.id;
  const ISSUE_NUMBER = '27';
  const COMIC = COMIC_BOOK_4;
  const METADATA_SOURCE = METADATA_SOURCE_1;

  let actions$: Observable<any>;
  let effects: MetadataEffects;
  let scrapingService: jasmine.SpyObj<MetadataService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatSnackBarModule
      ],
      providers: [
        MetadataEffects,
        provideMockActions(() => actions$),
        {
          provide: MetadataService,
          useValue: {
            loadScrapingVolumes: jasmine.createSpy(
              'MetadataService.loadScrapingVolumes()'
            ),
            loadScrapingIssue: jasmine.createSpy(
              'MetadataService.loadScrapingIssue()'
            ),
            scrapeComic: jasmine.createSpy('MetadataService.scrapeComic()'),
            clearCache: jasmine.createSpy('MetadataService.clearCache()'),
            startMetadataUpdateProcess: jasmine.createSpy(
              'MetadataService.startMetadataUpdateProcess()'
            )
          }
        },
        AlertService
      ]
    });

    effects = TestBed.inject(MetadataEffects);
    scrapingService = TestBed.inject(
      MetadataService
    ) as jasmine.SpyObj<MetadataService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'info');
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading scraping volumes', () => {
    it('fires an action on success', () => {
      const serviceResponse = VOLUMES;
      const action = loadVolumeMetadata({
        metadataSource: METADATA_SOURCE,
        series: SERIES,
        maximumRecords: MAXIMUM_RECORDS,
        skipCache: SKIP_CACHE
      });
      const outcome = volumeMetadataLoaded({ volumes: VOLUMES });

      actions$ = hot('-a', { a: action });
      scrapingService.loadScrapingVolumes.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadScrapingVolumes$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadVolumeMetadata({
        metadataSource: METADATA_SOURCE,
        series: SERIES,
        maximumRecords: MAXIMUM_RECORDS,
        skipCache: SKIP_CACHE
      });
      const outcome = loadVolumeMetadataFailed();

      actions$ = hot('-a', { a: action });
      scrapingService.loadScrapingVolumes.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.loadScrapingVolumes$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadVolumeMetadata({
        metadataSource: METADATA_SOURCE,
        series: SERIES,
        maximumRecords: MAXIMUM_RECORDS,
        skipCache: SKIP_CACHE
      });
      const outcome = loadVolumeMetadataFailed();

      actions$ = hot('-a', { a: action });
      scrapingService.loadScrapingVolumes.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadScrapingVolumes$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('loading a scraping issue', () => {
    it('fires an action on success', () => {
      const serviceResponse = SCRAPING_ISSUE;
      const action = loadIssueMetadata({
        metadataSource: METADATA_SOURCE,
        volumeId: VOLUME_ID,
        issueNumber: ISSUE_NUMBER,
        skipCache: SKIP_CACHE
      });
      const outcome = issueMetadataLoaded({ issue: SCRAPING_ISSUE });

      actions$ = hot('-a', { a: action });
      scrapingService.loadScrapingIssue.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadScrapingIssue$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadIssueMetadata({
        metadataSource: METADATA_SOURCE,
        volumeId: VOLUME_ID,
        issueNumber: ISSUE_NUMBER,
        skipCache: SKIP_CACHE
      });
      const outcome = loadIssueMetadataFailed();

      actions$ = hot('-a', { a: action });
      scrapingService.loadScrapingIssue.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.loadScrapingIssue$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadIssueMetadata({
        metadataSource: METADATA_SOURCE,
        volumeId: VOLUME_ID,
        issueNumber: ISSUE_NUMBER,
        skipCache: SKIP_CACHE
      });
      const outcome = loadIssueMetadataFailed();

      actions$ = hot('-a', { a: action });
      scrapingService.loadScrapingIssue.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadScrapingIssue$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('scraping a comic', () => {
    it('fires an action on success', () => {
      const serviceResponse = COMIC;
      const action = scrapeComic({
        metadataSource: METADATA_SOURCE,
        issueId: SCRAPING_ISSUE.id,
        comic: COMIC,
        skipCache: SKIP_CACHE
      });
      const outcome1 = comicScraped();
      const outcome2 = comicBookLoaded({ comicBook: COMIC });
      const outcome3 = removeSingleComicBookSelection({
        comicBookId: COMIC.id
      });

      actions$ = hot('-a', { a: action });
      scrapingService.scrapeComic.and.returnValue(of(serviceResponse));

      const expected = hot('-(bcd)', { b: outcome1, c: outcome2, d: outcome3 });
      expect(effects.scrapeComic$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = scrapeComic({
        metadataSource: METADATA_SOURCE,
        issueId: SCRAPING_ISSUE.id,
        comic: COMIC,
        skipCache: SKIP_CACHE
      });
      const outcome = scrapeComicFailed();

      actions$ = hot('-a', { a: action });
      scrapingService.scrapeComic.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.scrapeComic$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = scrapeComic({
        metadataSource: METADATA_SOURCE,
        issueId: SCRAPING_ISSUE.id,
        comic: COMIC,
        skipCache: SKIP_CACHE
      });
      const outcome = scrapeComicFailed();

      actions$ = hot('-a', { a: action });
      scrapingService.scrapeComic.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.scrapeComic$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('starting the metadata update process', () => {
    it('fires an action on success', () => {
      const serviceResponse = new HttpResponse({ status: 200 });
      const action = startMetadataUpdateProcess({
        skipCache: SKIP_CACHE
      });
      const outcome1 = startMetadataUpdateProcessSuccess();
      const outcome2 = clearComicBookSelectionState();

      actions$ = hot('-a', { a: action });
      scrapingService.startMetadataUpdateProcess
        .withArgs({ skipCache: SKIP_CACHE })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-(bc)', { b: outcome1, c: outcome2 });
      expect(effects.startMetadataUpdateProcess$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = startMetadataUpdateProcess({
        skipCache: SKIP_CACHE
      });
      const outcome = startMetadataUpdateProcessFailure();

      actions$ = hot('-a', { a: action });
      scrapingService.startMetadataUpdateProcess
        .withArgs({ skipCache: SKIP_CACHE })
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.startMetadataUpdateProcess$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = startMetadataUpdateProcess({
        skipCache: SKIP_CACHE
      });
      const outcome = startMetadataUpdateProcessFailure();

      actions$ = hot('-a', { a: action });
      scrapingService.startMetadataUpdateProcess
        .withArgs({ skipCache: SKIP_CACHE })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.startMetadataUpdateProcess$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('clearing the metadata cache', () => {
    it('fires an action on success', () => {
      const serviceResponse = new HttpResponse({ status: 200 });
      const action = clearMetadataCache();
      const outcome = metadataCacheCleared();

      actions$ = hot('-a', { a: action });
      scrapingService.clearCache.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.clearCache$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = clearMetadataCache();
      const outcome = clearMetadataCacheFailed();

      actions$ = hot('-a', { a: action });
      scrapingService.clearCache.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.clearCache$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = clearMetadataCache();
      const outcome = clearMetadataCacheFailed();

      actions$ = hot('-a', { a: action });
      scrapingService.clearCache.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.clearCache$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
