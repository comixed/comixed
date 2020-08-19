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

import { ScrapeComicEffects } from './scrape-comic.effects';
import { ScrapingService } from 'app/comics/services/scraping.service';
import { CoreModule } from 'app/core/core.module';
import { LoggerModule } from '@angular-ru/logger';
import { TranslateModule } from '@ngx-translate/core';
import { AlertService, ApiResponse } from 'app/core';
import { MessageService } from 'primeng/api';
import { COMIC_1 } from 'app/comics/models/comic.fixtures';
import { SCRAPING_ISSUE_1000 } from 'app/comics/models/scraping-issue.fixtures';
import {
  comicScraped,
  scrapeComic,
  scrapeComicFailed
} from 'app/comics/actions/scrape-comic.actions';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse } from '@angular/common/http';
import { Comic } from 'app/comics';

describe('ScrapeComicEffects', () => {
  const API_KEY = 'A0B1C2D3E4F56789';
  const COMIC = COMIC_1;
  const ISSUE = SCRAPING_ISSUE_1000;
  const SKIP_CACHE = true;

  let actions$: Observable<any>;
  let effects: ScrapeComicEffects;
  let scrapingService: jasmine.SpyObj<ScrapingService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CoreModule, LoggerModule.forRoot(), TranslateModule.forRoot()],
      providers: [
        ScrapeComicEffects,
        provideMockActions(() => actions$),
        {
          provide: ScrapingService,
          useValue: {
            loadMetadata: jasmine.createSpy('ScrapingService.loadMetadata()')
          }
        },
        MessageService
      ]
    });

    effects = TestBed.get<ScrapeComicEffects>(ScrapeComicEffects);
    scrapingService = TestBed.get(ScrapingService) as jasmine.SpyObj<
      ScrapingService
    >;
    alertService = TestBed.get(AlertService);
    spyOn(alertService, 'info');
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('scraping a comic', () => {
    it('fires an action on success', () => {
      const serviceResponse = { success: true, result: COMIC } as ApiResponse<
        Comic
      >;
      const action = scrapeComic({
        apiKey: API_KEY,
        comicId: COMIC.id,
        issueNumber: ISSUE.issueNumber,
        skipCache: SKIP_CACHE
      });
      const outcome = comicScraped({ comic: COMIC });

      actions$ = hot('-a', { a: action });
      scrapingService.loadMetadata.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.scrapeComic$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on failure', () => {
      const serviceResponse = { success: false } as ApiResponse<Comic>;
      const action = scrapeComic({
        apiKey: API_KEY,
        comicId: COMIC.id,
        issueNumber: ISSUE.issueNumber,
        skipCache: SKIP_CACHE
      });
      const outcome = scrapeComicFailed();

      actions$ = hot('-a', { a: action });
      scrapingService.loadMetadata.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.scrapeComic$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = scrapeComic({
        apiKey: API_KEY,
        comicId: COMIC.id,
        issueNumber: ISSUE.issueNumber,
        skipCache: SKIP_CACHE
      });
      const outcome = scrapeComicFailed();

      actions$ = hot('-a', { a: action });
      scrapingService.loadMetadata.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.scrapeComic$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = scrapeComic({
        apiKey: API_KEY,
        comicId: COMIC.id,
        issueNumber: ISSUE.issueNumber,
        skipCache: SKIP_CACHE
      });
      const outcome = scrapeComicFailed();

      actions$ = hot('-a', { a: action });
      scrapingService.loadMetadata.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.scrapeComic$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
