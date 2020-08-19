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

import { ScrapingIssueEffects } from './scraping-issue.effects';
import { AlertService, ApiResponse } from 'app/core';
import { ScrapingService } from 'app/comics/services/scraping.service';
import { CoreModule } from 'app/core/core.module';
import { SCRAPING_VOLUME_1003 } from 'app/comics/models/scraping-volume.fixtures';
import { SCRAPING_ISSUE_1000 } from 'app/comics/models/scraping-issue.fixtures';
import {
  getScrapingIssue,
  getScrapingIssueFailed,
  scrapingIssueReceived
} from 'app/comics/actions/scraping-issue.actions';
import { hot } from 'jasmine-marbles';
import { LoggerModule } from '@angular-ru/logger';
import { MessageService } from 'primeng/api';
import { TranslateModule } from '@ngx-translate/core';
import { ScrapingIssue } from 'app/comics/models/scraping-issue';
import { HttpErrorResponse } from '@angular/common/http';

describe('ScrapingIssuesEffects', () => {
  const API_KEY = 'A0B1C2D3E4F56789';
  const SCRAPING_VOLUME = SCRAPING_VOLUME_1003;
  const ISSUE = SCRAPING_ISSUE_1000;
  const SKIP_CACHE = true;

  let actions$: Observable<any>;
  let effects: ScrapingIssueEffects;
  let scrapingService: jasmine.SpyObj<ScrapingService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CoreModule, LoggerModule.forRoot(), TranslateModule.forRoot()],
      providers: [
        ScrapingIssueEffects,
        provideMockActions(() => actions$),
        {
          provide: ScrapingService,
          useValue: {
            getIssue: jasmine.createSpy('ScrapingService.getIssue()')
          }
        },
        MessageService
      ]
    });

    effects = TestBed.get<ScrapingIssueEffects>(ScrapingIssueEffects);
    scrapingService = TestBed.get(ScrapingService) as jasmine.SpyObj<
      ScrapingService
    >;
    alertService = TestBed.get(AlertService);
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('getting a scraping issue', () => {
    it('fires an action on success', () => {
      const serviceResponse = { success: true, result: ISSUE } as ApiResponse<
        ScrapingIssue
      >;
      const action = getScrapingIssue({
        apiKey: API_KEY,
        volumeId: SCRAPING_VOLUME.id,
        issueNumber: ISSUE.issueNumber,
        skipCache: SKIP_CACHE
      });
      const outcome = scrapingIssueReceived({ issue: ISSUE });

      actions$ = hot('-a', { a: action });
      scrapingService.getIssue.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.getScrapingIssue$).toBeObservable(expected);
    });

    it('fires an action on failure', () => {
      const serviceResponse = { success: false } as ApiResponse<ScrapingIssue>;
      const action = getScrapingIssue({
        apiKey: API_KEY,
        volumeId: SCRAPING_VOLUME.id,
        issueNumber: ISSUE.issueNumber,
        skipCache: SKIP_CACHE
      });
      const outcome = getScrapingIssueFailed();

      actions$ = hot('-a', { a: action });
      scrapingService.getIssue.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.getScrapingIssue$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = getScrapingIssue({
        apiKey: API_KEY,
        volumeId: SCRAPING_VOLUME.id,
        issueNumber: ISSUE.issueNumber,
        skipCache: SKIP_CACHE
      });
      const outcome = getScrapingIssueFailed();

      actions$ = hot('-a', { a: action });
      scrapingService.getIssue.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.getScrapingIssue$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = getScrapingIssue({
        apiKey: API_KEY,
        volumeId: SCRAPING_VOLUME.id,
        issueNumber: ISSUE.issueNumber,
        skipCache: SKIP_CACHE
      });
      const outcome = getScrapingIssueFailed();

      actions$ = hot('-a', { a: action });
      scrapingService.getIssue.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.getScrapingIssue$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
