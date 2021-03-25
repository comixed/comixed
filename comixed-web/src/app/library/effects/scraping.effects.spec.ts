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
import { ScrapingEffects } from './scraping.effects';
import { ScrapingService } from '@app/library/services/scraping.service';
import {
  COMIC_4,
  SCRAPING_ISSUE_1,
  SCRAPING_VOLUME_1,
  SCRAPING_VOLUME_2,
  SCRAPING_VOLUME_3
} from '@app/library/library.fixtures';
import {
  comicScraped,
  loadScrapingIssue,
  loadScrapingIssueFailed,
  loadScrapingVolumes,
  loadScrapingVolumesFailed,
  scrapeComic,
  scrapeComicFailed,
  scrapingIssueLoaded,
  scrapingVolumesLoaded
} from '@app/library/actions/scraping.actions';
import { hot } from 'jasmine-marbles';
import { AlertService } from '@app/core';
import { LoggerModule } from '@angular-ru/logger';
import { TranslateModule } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { comicLoaded } from '@app/library/actions/comic.actions';

describe('ScrapingEffects', () => {
  const API_KEY = '1234567890ABCDEF';
  const SERIES = 'The Series';
  const MAXIMUM_RECORDS = 100;
  const SKIP_CACHE = Math.random() > 0.5;
  const VOLUMES = [SCRAPING_VOLUME_1, SCRAPING_VOLUME_2, SCRAPING_VOLUME_3];
  const SCRAPING_ISSUE = SCRAPING_ISSUE_1;
  const VOLUME_ID = SCRAPING_VOLUME_1.id;
  const ISSUE_NUMBER = '27';
  const COMIC = COMIC_4;

  let actions$: Observable<any>;
  let effects: ScrapingEffects;
  let scrapingService: jasmine.SpyObj<ScrapingService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatSnackBarModule
      ],
      providers: [
        ScrapingEffects,
        provideMockActions(() => actions$),
        {
          provide: ScrapingService,
          useValue: {
            loadScrapingVolumes: jasmine.createSpy(
              'ScrapingService.loadScrapingVolumes()'
            ),
            loadScrapingIssue: jasmine.createSpy(
              'ScrapingService.loadScrapingIssue()'
            ),
            scrapeComic: jasmine.createSpy('ScrapingService.scrapeComic()')
          }
        },
        AlertService
      ]
    });

    effects = TestBed.inject(ScrapingEffects);
    scrapingService = TestBed.inject(
      ScrapingService
    ) as jasmine.SpyObj<ScrapingService>;
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
      const action = loadScrapingVolumes({
        apiKey: API_KEY,
        series: SERIES,
        maximumRecords: MAXIMUM_RECORDS,
        skipCache: SKIP_CACHE
      });
      const outcome = scrapingVolumesLoaded({ volumes: VOLUMES });

      actions$ = hot('-a', { a: action });
      scrapingService.loadScrapingVolumes.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadScrapingVolumes$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadScrapingVolumes({
        apiKey: API_KEY,
        series: SERIES,
        maximumRecords: MAXIMUM_RECORDS,
        skipCache: SKIP_CACHE
      });
      const outcome = loadScrapingVolumesFailed();

      actions$ = hot('-a', { a: action });
      scrapingService.loadScrapingVolumes.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.loadScrapingVolumes$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadScrapingVolumes({
        apiKey: API_KEY,
        series: SERIES,
        maximumRecords: MAXIMUM_RECORDS,
        skipCache: SKIP_CACHE
      });
      const outcome = loadScrapingVolumesFailed();

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
      const action = loadScrapingIssue({
        apiKey: API_KEY,
        volumeId: VOLUME_ID,
        issueNumber: ISSUE_NUMBER,
        skipCache: SKIP_CACHE
      });
      const outcome = scrapingIssueLoaded({ issue: SCRAPING_ISSUE });

      actions$ = hot('-a', { a: action });
      scrapingService.loadScrapingIssue.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadScrapingIssue$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadScrapingIssue({
        apiKey: API_KEY,
        volumeId: VOLUME_ID,
        issueNumber: ISSUE_NUMBER,
        skipCache: SKIP_CACHE
      });
      const outcome = loadScrapingIssueFailed();

      actions$ = hot('-a', { a: action });
      scrapingService.loadScrapingIssue.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.loadScrapingIssue$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadScrapingIssue({
        apiKey: API_KEY,
        volumeId: VOLUME_ID,
        issueNumber: ISSUE_NUMBER,
        skipCache: SKIP_CACHE
      });
      const outcome = loadScrapingIssueFailed();

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
        apiKey: API_KEY,
        issueId: SCRAPING_ISSUE.id,
        comic: COMIC,
        skipCache: SKIP_CACHE
      });
      const outcome1 = comicScraped();
      const outcome2 = comicLoaded({ comic: COMIC });

      actions$ = hot('-a', { a: action });
      scrapingService.scrapeComic.and.returnValue(of(serviceResponse));

      const expected = hot('-(bc)', { b: outcome1, c: outcome2 });
      expect(effects.scrapeComic$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = scrapeComic({
        apiKey: API_KEY,
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
        apiKey: API_KEY,
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
});
