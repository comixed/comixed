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
import { DownloadReadingListEffects } from './download-reading-list.effects';
import { ReadingListService } from '@app/lists/services/reading-list.service';
import { AlertService } from '@app/core/services/alert.service';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FileDownloadService } from '@app/core/services/file-download.service';
import {
  downloadReadingList,
  downloadReadingListFailed,
  readingListDownloaded
} from '@app/lists/actions/download-reading-list.actions';
import { hot } from 'jasmine-marbles';
import { DownloadDocument } from '@app/core/models/download-document';
import { READING_LIST_3 } from '@app/lists/lists.fixtures';
import { HttpErrorResponse } from '@angular/common/http';

describe('DownloadReadingListEffects', () => {
  const READING_LIST = READING_LIST_3;
  const DOWNLOAD_DOCUMENT = {
    filename: 'filename',
    content: 'content',
    mediaType: 'text/csv'
  } as DownloadDocument;

  let actions$: Observable<any>;
  let effects: DownloadReadingListEffects;
  let readingListService: jasmine.SpyObj<ReadingListService>;
  let alertService: AlertService;
  let fileDownloadService: FileDownloadService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatSnackBarModule
      ],
      providers: [
        DownloadReadingListEffects,
        provideMockActions(() => actions$),
        {
          provide: ReadingListService,
          useValue: {
            downloadFile: jasmine.createSpy('ReadingListService.downloadFile()')
          }
        },
        AlertService,
        FileDownloadService
      ]
    });

    effects = TestBed.inject(DownloadReadingListEffects);
    readingListService = TestBed.inject(
      ReadingListService
    ) as jasmine.SpyObj<ReadingListService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'error');
    fileDownloadService = TestBed.inject(FileDownloadService);
    spyOn(fileDownloadService, 'saveFile');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('downloading a reading list', () => {
    it('fires an action on success', () => {
      const serviceResponse = DOWNLOAD_DOCUMENT;
      const action = downloadReadingList({ list: READING_LIST });
      const outcome = readingListDownloaded();

      actions$ = hot('-a', { a: action });
      readingListService.downloadFile
        .withArgs({ list: READING_LIST })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.downloadReadingList$).toBeObservable(expected);
      expect(fileDownloadService.saveFile).toHaveBeenCalledWith({
        document: DOWNLOAD_DOCUMENT
      });
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = downloadReadingList({ list: READING_LIST });
      const outcome = downloadReadingListFailed();

      actions$ = hot('-a', { a: action });
      readingListService.downloadFile
        .withArgs({ list: READING_LIST })
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.downloadReadingList$).toBeObservable(expected);
      expect(fileDownloadService.saveFile).not.toHaveBeenCalledWith(
        jasmine.anything()
      );
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = downloadReadingList({ list: READING_LIST });
      const outcome = downloadReadingListFailed();

      actions$ = hot('-a', { a: action });
      readingListService.downloadFile
        .withArgs({ list: READING_LIST })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.downloadReadingList$).toBeObservable(expected);
      expect(fileDownloadService.saveFile).not.toHaveBeenCalledWith(
        jasmine.anything()
      );
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
