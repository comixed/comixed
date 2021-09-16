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
import { UploadReadingListEffects } from './upload-reading-list.effects';
import { ReadingListService } from '@app/lists/services/reading-list.service';
import { AlertService } from '@app/core/services/alert.service';
import { LoggerModule } from '@angular-ru/logger';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import {
  readingListUploaded,
  uploadReadingList,
  uploadReadingListFailed
} from '@app/lists/actions/upload-reading-list.actions';
import { hot } from 'jasmine-marbles';

describe('UploadReadingListEffects', () => {
  const FILE = new File([], 'testing');

  let actions$: Observable<any>;
  let effects: UploadReadingListEffects;
  let readingListService: jasmine.SpyObj<ReadingListService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatSnackBarModule
      ],
      providers: [
        UploadReadingListEffects,
        provideMockActions(() => actions$),
        {
          provide: ReadingListService,
          useValue: {
            uploadFile: jasmine.createSpy('ReadingListService.uploadFile()')
          }
        },
        AlertService
      ]
    });

    effects = TestBed.inject(UploadReadingListEffects);
    readingListService = TestBed.inject(
      ReadingListService
    ) as jasmine.SpyObj<ReadingListService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'info');
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('uploading a reading list', () => {
    it('fires an action on success', () => {
      const serviceResponse = new HttpResponse({ status: 200 });
      const action = uploadReadingList({ file: FILE });
      const outcome = readingListUploaded();

      actions$ = hot('-a', { a: action });
      readingListService.uploadFile
        .withArgs({ file: FILE })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.uploadReadingList$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = uploadReadingList({ file: FILE });
      const outcome = uploadReadingListFailed();

      actions$ = hot('-a', { a: action });
      readingListService.uploadFile
        .withArgs({ file: FILE })
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.uploadReadingList$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = uploadReadingList({ file: FILE });
      const outcome = uploadReadingListFailed();

      actions$ = hot('-a', { a: action });
      readingListService.uploadFile
        .withArgs({ file: FILE })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.uploadReadingList$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
