/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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
import { ScrapeMetadataEffects } from './scrape-metadata.effects';
import { ComicImportService } from '@app/comic-files/services/comic-import.service';
import { AlertService } from '@app/core/services/alert.service';
import { COMIC_DETAIL_2 } from '@app/comic-books/comic-books.fixtures';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FilenameMetadataResponse } from '@app/comic-files/models/net/filename-metadata-response';
import {
  metadataScrapedFromFilename,
  scrapeMetadataFromFilename,
  scrapeMetadataFromFilenameFailed
} from '@app/comic-files/actions/scrape-metadata.actions';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse } from '@angular/common/http';

describe('ScrapeMetadataEffects', () => {
  const FILENAME = COMIC_DETAIL_2.baseFilename;
  const SERIES = COMIC_DETAIL_2.series;
  const VOLUME = COMIC_DETAIL_2.volume;
  const ISSUE_NUMBER = COMIC_DETAIL_2.issueNumber;

  let actions$: Observable<any>;
  let effects: ScrapeMetadataEffects;
  let comicImportService: jasmine.SpyObj<ComicImportService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatSnackBarModule
      ],
      providers: [
        ScrapeMetadataEffects,
        provideMockActions(() => actions$),
        {
          provide: ComicImportService,
          useValue: {
            scrapeFilename: jasmine.createSpy(
              'ComicImportService.scrapeFilename()'
            )
          }
        }
      ]
    });

    effects = TestBed.inject(ScrapeMetadataEffects);
    comicImportService = TestBed.inject(
      ComicImportService
    ) as jasmine.SpyObj<ComicImportService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'info');
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('scraping a filename', () => {
    const FOUND = Math.random() > 0.5;

    it('fires an action on success', () => {
      const serviceResponse = {
        found: FOUND,
        series: SERIES,
        volume: VOLUME,
        issueNumber: ISSUE_NUMBER
      } as FilenameMetadataResponse;
      const action = scrapeMetadataFromFilename({ filename: FILENAME });
      const outcome = metadataScrapedFromFilename({
        found: FOUND,
        series: SERIES,
        volume: VOLUME,
        issueNumber: ISSUE_NUMBER
      });

      actions$ = hot('-a', { a: action });
      comicImportService.scrapeFilename
        .withArgs({ filename: FILENAME })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.scrapeFilename$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = scrapeMetadataFromFilename({ filename: FILENAME });
      const outcome = scrapeMetadataFromFilenameFailed();

      actions$ = hot('-a', { a: action });
      comicImportService.scrapeFilename
        .withArgs({ filename: FILENAME })
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.scrapeFilename$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = scrapeMetadataFromFilename({ filename: FILENAME });
      const outcome = scrapeMetadataFromFilenameFailed();

      actions$ = hot('-a', { a: action });
      comicImportService.scrapeFilename
        .withArgs({ filename: FILENAME })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.scrapeFilename$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
