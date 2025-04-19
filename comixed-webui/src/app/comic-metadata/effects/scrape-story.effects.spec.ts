/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2025, The ComiXed Project
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

import { ScrapeStoryEffects } from './scrape-story.effects';
import { ComicBookScrapingService } from '@app/comic-metadata/services/comic-book-scraping.service';
import {
  STORY_METADATA_1,
  STORY_METADATA_2,
  STORY_METADATA_3
} from '@app/comic-metadata/comic-metadata.constants';
import { METADATA_SOURCE_1 } from '@app/comic-metadata/comic-metadata.fixtures';
import { AlertService } from '@app/core/services/alert.service';
import { TranslateModule } from '@ngx-translate/core';
import { LoggerModule } from '@angular-ru/cdk/logger';
import {
  loadStoryCandidates,
  loadStoryCandidatesFailure,
  loadStoryCandidatesSuccess,
  scrapeStoryMetadata,
  scrapeStoryMetadataFailure,
  scrapeStoryMetadataSuccess
} from '@app/comic-metadata/actions/scrape-story.actions';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';

describe('ScrapeStoryEffects', () => {
  const METADATA_SOURCE = METADATA_SOURCE_1;
  const STORY_METADATA_LIST = [
    STORY_METADATA_1,
    STORY_METADATA_2,
    STORY_METADATA_3
  ];
  const STORY_NAME = STORY_METADATA_1.name;
  const MAX_RECORDS = 1000;
  const SKIP_CACHE = Math.random() > 0.5;
  const REFERENCE_ID = STORY_METADATA_1.referenceId;

  let actions$: Observable<any>;
  let effects: ScrapeStoryEffects;
  let comicBookScrapingService: jasmine.SpyObj<ComicBookScrapingService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoggerModule.forRoot(), TranslateModule.forRoot()],
      providers: [
        ScrapeStoryEffects,
        provideMockActions(() => actions$),
        {
          provide: ComicBookScrapingService,
          useValue: {
            loadStoryCandidates: jasmine.createSpy(
              'ComicBookScrapingservice.loadStoryCandidates{}'
            ),
            scrapeStory: jasmine.createSpy(
              'ComicBookScrapingservice.scrapeStory{}'
            )
          }
        },
        AlertService
      ]
    });

    effects = TestBed.inject(ScrapeStoryEffects);
    comicBookScrapingService = TestBed.inject(
      ComicBookScrapingService
    ) as jasmine.SpyObj<ComicBookScrapingService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'info');
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading story candidates', () => {
    it('fires an action on success', () => {
      const serviceResponse = STORY_METADATA_LIST;
      const action = loadStoryCandidates({
        sourceId: METADATA_SOURCE.metadataSourceId,
        name: STORY_NAME,
        maxRecords: MAX_RECORDS,
        skipCache: SKIP_CACHE
      });
      const outcome = loadStoryCandidatesSuccess({
        candidates: STORY_METADATA_LIST
      });

      actions$ = hot('-a', { a: action });
      comicBookScrapingService.loadStoryCandidates
        .withArgs({
          sourceId: METADATA_SOURCE.metadataSourceId,
          storyName: STORY_NAME,
          maxRecords: MAX_RECORDS,
          skipCache: SKIP_CACHE
        })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadStoryCandidates$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadStoryCandidates({
        sourceId: METADATA_SOURCE.metadataSourceId,
        name: STORY_NAME,
        maxRecords: MAX_RECORDS,
        skipCache: SKIP_CACHE
      });
      const outcome = loadStoryCandidatesFailure();

      actions$ = hot('-a', { a: action });
      comicBookScrapingService.loadStoryCandidates
        .withArgs({
          sourceId: METADATA_SOURCE.metadataSourceId,
          storyName: STORY_NAME,
          maxRecords: MAX_RECORDS,
          skipCache: SKIP_CACHE
        })
        .and.returnValue(throwError(() => serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadStoryCandidates$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadStoryCandidates({
        sourceId: METADATA_SOURCE.metadataSourceId,
        name: STORY_NAME,
        maxRecords: MAX_RECORDS,
        skipCache: SKIP_CACHE
      });
      const outcome = loadStoryCandidatesFailure();

      actions$ = hot('-a', { a: action });
      comicBookScrapingService.loadStoryCandidates
        .withArgs({
          sourceId: METADATA_SOURCE.metadataSourceId,
          storyName: STORY_NAME,
          maxRecords: MAX_RECORDS,
          skipCache: SKIP_CACHE
        })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadStoryCandidates$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('scraping a story', () => {
    it('fires an action on success', () => {
      const serviceResponse = new HttpResponse({ status: 200 });
      const action = scrapeStoryMetadata({
        sourceId: METADATA_SOURCE.metadataSourceId,
        referenceId: REFERENCE_ID,
        skipCache: SKIP_CACHE
      });
      const outcome = scrapeStoryMetadataSuccess();

      actions$ = hot('-a', { a: action });
      comicBookScrapingService.scrapeStory
        .withArgs({
          sourceId: METADATA_SOURCE.metadataSourceId,
          referenceId: REFERENCE_ID,
          skipCache: SKIP_CACHE
        })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.scrapeStory$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = scrapeStoryMetadata({
        sourceId: METADATA_SOURCE.metadataSourceId,
        referenceId: REFERENCE_ID,
        skipCache: SKIP_CACHE
      });
      const outcome = scrapeStoryMetadataFailure();

      actions$ = hot('-a', { a: action });
      comicBookScrapingService.scrapeStory
        .withArgs({
          sourceId: METADATA_SOURCE.metadataSourceId,
          referenceId: REFERENCE_ID,
          skipCache: SKIP_CACHE
        })
        .and.returnValue(throwError(() => serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.scrapeStory$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = scrapeStoryMetadata({
        sourceId: METADATA_SOURCE.metadataSourceId,
        referenceId: REFERENCE_ID,
        skipCache: SKIP_CACHE
      });
      const outcome = scrapeStoryMetadataFailure();

      actions$ = hot('-a', { a: action });
      comicBookScrapingService.scrapeStory
        .withArgs({
          sourceId: METADATA_SOURCE.metadataSourceId,
          referenceId: REFERENCE_ID,
          skipCache: SKIP_CACHE
        })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.scrapeStory$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
