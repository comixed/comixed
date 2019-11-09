/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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
import { ScrapingService } from 'app/comics/services/scraping.service';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import {
  SCRAPING_VOLUME_1001,
  SCRAPING_VOLUME_1002,
  SCRAPING_VOLUME_1003,
  SCRAPING_VOLUME_1004,
  SCRAPING_VOLUME_1005
} from 'app/comics/models/scraping-volume.fixtures';
import { SCRAPING_ISSUE_1000 } from 'app/comics/models/scraping-issue.fixtures';
import {
  ScrapingGetIssue,
  ScrapingGetIssueFailed,
  ScrapingGetVolumes,
  ScrapingGetVolumesFailed,
  ScrapingIssueReceived,
  ScrapingLoadMetadata,
  ScrapingLoadMetadataFailed,
  ScrapingMetadataLoaded,
  ScrapingVolumesReceived
} from 'app/comics/actions/scraping.actions';
import { hot } from 'jasmine-marbles';
import objectContaining = jasmine.objectContaining;
import { HttpErrorResponse } from '@angular/common/http';
import { COMIC_1 } from 'app/comics/models/comic.fixtures';

describe('ScrapingEffects', () => {
  const API_KEY = 'A0B1C2D3E4F56789';
  const SERIES = 'Awesome Comic Series';
  const VOLUME = '2019';
  const SKIP_CACHE = true;
  const VOLUMES = [
    SCRAPING_VOLUME_1001,
    SCRAPING_VOLUME_1002,
    SCRAPING_VOLUME_1003,
    SCRAPING_VOLUME_1004,
    SCRAPING_VOLUME_1005
  ];
  const SCRAPING_VOLUME = SCRAPING_VOLUME_1003;
  const ISSUES = [SCRAPING_ISSUE_1000];
  const ISSUE = SCRAPING_ISSUE_1000;
  const COMIC = COMIC_1;

  let actions$: Observable<any>;
  let effects: ScrapingEffects;
  let scrapingService: jasmine.SpyObj<ScrapingService>;
  let messageService: MessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        ScrapingEffects,
        provideMockActions(() => actions$),
        {
          provide: ScrapingService,
          useValue: {
            getVolumes: jasmine.createSpy('ScrapingService.getVolumes()'),
            getIssue: jasmine.createSpy('ScrapingService.getIssue()'),
            loadMetadata: jasmine.createSpy('ScrapingService.loadMetadata()')
          }
        },
        MessageService
      ]
    });

    effects = TestBed.get(ScrapingEffects);
    scrapingService = TestBed.get(ScrapingService);
    messageService = TestBed.get(MessageService);
    spyOn(messageService, 'add');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('getting volumes for a comic', () => {
    it('fires an action on success', () => {
      const serviceResponse = VOLUMES;
      const action = new ScrapingGetVolumes({
        apiKey: API_KEY,
        series: SERIES,
        volume: VOLUME,
        skipCache: SKIP_CACHE
      });
      const outcome = new ScrapingVolumesReceived({ volumes: serviceResponse });

      actions$ = hot('-a', { a: action });
      scrapingService.getVolumes.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.getVolumes$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'info' })
      );
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = new ScrapingGetVolumes({
        apiKey: API_KEY,
        series: SERIES,
        volume: VOLUME,
        skipCache: SKIP_CACHE
      });
      const outcome = new ScrapingGetVolumesFailed();

      actions$ = hot('-a', { a: action });
      scrapingService.getVolumes.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.getVolumes$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });

    it('fires an action on general failure', () => {
      const action = new ScrapingGetVolumes({
        apiKey: API_KEY,
        series: SERIES,
        volume: VOLUME,
        skipCache: SKIP_CACHE
      });
      const outcome = new ScrapingGetVolumesFailed();

      actions$ = hot('-a', { a: action });
      scrapingService.getVolumes.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.getVolumes$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });
  });

  describe('getting a single issue', () => {
    it('fires an action on success', () => {
      const serviceResponse = ISSUE;
      const action = new ScrapingGetIssue({
        apiKey: API_KEY,
        volumeId: SCRAPING_VOLUME.id,
        issueNumber: ISSUE.issueNumber,
        skipCache: SKIP_CACHE
      });
      const outcome = new ScrapingIssueReceived({ issue: serviceResponse });

      actions$ = hot('-a', { a: action });
      scrapingService.getIssue.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.getIssue$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'info' })
      );
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = new ScrapingGetIssue({
        apiKey: API_KEY,
        volumeId: SCRAPING_VOLUME.id,
        issueNumber: ISSUE.issueNumber,
        skipCache: SKIP_CACHE
      });
      const outcome = new ScrapingGetIssueFailed();

      actions$ = hot('-a', { a: action });
      scrapingService.getIssue.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.getIssue$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });

    it('fires an action on general failure', () => {
      const action = new ScrapingGetIssue({
        apiKey: API_KEY,
        volumeId: SCRAPING_VOLUME.id,
        issueNumber: ISSUE.issueNumber,
        skipCache: SKIP_CACHE
      });
      const outcome = new ScrapingGetIssueFailed();

      actions$ = hot('-a', { a: action });
      scrapingService.getIssue.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.getIssue$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });
  });

  describe('loading metadata for a single issue', () => {
    it('fires an action on success', () => {
      const serviceResponse = COMIC;
      const action = new ScrapingLoadMetadata({
        apiKey: API_KEY,
        comicId: COMIC.id,
        issueNumber: ISSUE.issueNumber,
        skipCache: SKIP_CACHE
      });
      const outcome = new ScrapingMetadataLoaded({ comic: serviceResponse });

      actions$ = hot('-a', { a: action });
      scrapingService.loadMetadata.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadMetadata$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'info' })
      );
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = new ScrapingLoadMetadata({
        apiKey: API_KEY,
        comicId: COMIC.id,
        issueNumber: ISSUE.issueNumber,
        skipCache: SKIP_CACHE
      });
      const outcome = new ScrapingLoadMetadataFailed();

      actions$ = hot('-a', { a: action });
      scrapingService.loadMetadata.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadMetadata$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });

    it('fires an action on general failure', () => {
      const action = new ScrapingLoadMetadata({
        apiKey: API_KEY,
        comicId: COMIC.id,
        issueNumber: ISSUE.issueNumber,
        skipCache: SKIP_CACHE
      });
      const outcome = new ScrapingLoadMetadataFailed();

      actions$ = hot('-a', { a: action });
      scrapingService.loadMetadata.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadMetadata$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });
  });
});
