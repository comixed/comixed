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
import { ComicBookEffects } from './comic-book.effects';
import { ComicBookService } from '@app/comic-books/services/comic-book.service';
import { AlertService } from '@app/core/services/alert.service';
import {
  COMIC_METADATA_SOURCE_1,
  COMIC_TAG_1,
  COMIC_TAG_2,
  COMIC_TAG_3,
  COMIC_TAG_4,
  COMIC_TAG_5,
  DISPLAYABLE_COMIC_1
} from '@app/comic-books/comic-books.fixtures';
import {
  comicBookLoaded,
  comicBookUpdated,
  downloadComicBook,
  downloadComicBookFailure,
  downloadComicBookSuccess,
  loadComicBook,
  loadComicBookFailed,
  pageDeletionUpdated,
  pageOrderSaved,
  savePageOrder,
  savePageOrderFailed,
  updateComicBook,
  updateComicBookFailed,
  updatePageDeletion,
  updatePageDeletionFailed
} from '@app/comic-books/actions/comic-book.actions';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {
  PAGE_1,
  PAGE_2,
  PAGE_3,
  PAGE_4
} from '@app/comic-pages/comic-pages.fixtures';
import { DownloadDocument } from '@app/core/models/download-document';
import { FileDownloadService } from '@app/core/services/file-download.service';
import { LoadComicBookResponse } from '@app/comic-books/models/net/load-comic-book-response';

describe('ComicBookEffects', () => {
  const DETAILS = DISPLAYABLE_COMIC_1;
  const METADATA = COMIC_METADATA_SOURCE_1;
  const PAGES = [PAGE_1, PAGE_2, PAGE_3, PAGE_4];
  const TAGS = [
    COMIC_TAG_1,
    COMIC_TAG_2,
    COMIC_TAG_3,
    COMIC_TAG_4,
    COMIC_TAG_5
  ];
  const PAGE = PAGE_1;
  const DELETED = Math.random() > 0.5;
  const DOWNLOAD_COMIC_BOOK = {
    filename: DETAILS.filename,
    content: 'content',
    mediaType: 'application/octet'
  } as DownloadDocument;

  let actions$: Observable<any>;
  let effects: ComicBookEffects;
  let comicService: jasmine.SpyObj<ComicBookService>;
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
        ComicBookEffects,
        provideMockActions(() => actions$),
        {
          provide: ComicBookService,
          useValue: {
            loadOne: jasmine.createSpy('ComicBookService.loadOne()'),
            updateOne: jasmine.createSpy('ComicBookService.updateOne()'),
            updatePageDeletion: jasmine.createSpy(
              'ComicBookService.updatePageDeletion()'
            ),
            savePageOrder: jasmine.createSpy(
              'ComicBookService.savePageOrder()'
            ),
            downloadComicBook: jasmine.createSpy(
              'ComicBookService.downloadComicBook()'
            )
          }
        },
        AlertService,
        FileDownloadService
      ]
    });

    effects = TestBed.inject(ComicBookEffects);
    comicService = TestBed.inject(
      ComicBookService
    ) as jasmine.SpyObj<ComicBookService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'error');
    spyOn(alertService, 'info');
    fileDownloadService = TestBed.inject(FileDownloadService);
    spyOn(fileDownloadService, 'saveFile');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading a single comic', () => {
    it('fires an action on success', () => {
      const serviceResponse = {
        details: DETAILS,
        metadata: METADATA,
        pages: PAGES,
        tags: TAGS
      } as LoadComicBookResponse;
      const action = loadComicBook({ id: DETAILS.comicBookId });
      const outcome = comicBookLoaded({
        details: DETAILS,
        metadata: METADATA,
        pages: PAGES,
        tags: TAGS
      });

      actions$ = hot('-a', { a: action });
      comicService.loadOne.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadOne$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadComicBook({ id: DETAILS.comicBookId });
      const outcome = loadComicBookFailed();

      actions$ = hot('-a', { a: action });
      comicService.loadOne.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadOne$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadComicBook({ id: DETAILS.comicBookId });
      const outcome = loadComicBookFailed();

      actions$ = hot('-a', { a: action });
      comicService.loadOne.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadOne$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('saving a single comic', () => {
    it('fires an action on success', () => {
      const serviceResponse = {
        details: DETAILS,
        metadata: METADATA,
        pages: PAGES
      } as LoadComicBookResponse;
      const action = updateComicBook({
        comicBookId: DETAILS.comicBookId,
        comicType: DETAILS.comicType,
        publisher: DETAILS.publisher,
        series: DETAILS.series,
        volume: DETAILS.volume,
        issueNumber: DETAILS.issueNumber,
        imprint: DETAILS.imprint,
        sortName: DETAILS.sortName,
        title: DETAILS.title,
        storeDate: DETAILS.storeDate,
        coverDate: DETAILS.coverDate
      });
      const outcome = comicBookUpdated({
        details: DETAILS,
        metadata: METADATA,
        pages: PAGES
      });

      actions$ = hot('-a', { a: action });
      comicService.updateOne
        .withArgs({
          comicBookId: DETAILS.comicBookId,
          comicType: DETAILS.comicType,
          publisher: DETAILS.publisher,
          series: DETAILS.series,
          volume: DETAILS.volume,
          issueNumber: DETAILS.issueNumber,
          imprint: DETAILS.imprint,
          sortName: DETAILS.sortName,
          title: DETAILS.title,
          storeDate: DETAILS.storeDate,
          coverDate: DETAILS.coverDate
        })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.saveOne$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = updateComicBook({
        comicBookId: DETAILS.comicBookId,
        comicType: DETAILS.comicType,
        publisher: DETAILS.publisher,
        series: DETAILS.series,
        volume: DETAILS.volume,
        issueNumber: DETAILS.issueNumber,
        imprint: DETAILS.imprint,
        sortName: DETAILS.sortName,
        title: DETAILS.title,
        storeDate: DETAILS.storeDate,
        coverDate: DETAILS.coverDate
      });

      const outcome = updateComicBookFailed();

      actions$ = hot('-a', { a: action });
      comicService.updateOne
        .withArgs({
          comicBookId: DETAILS.comicBookId,
          comicType: DETAILS.comicType,
          publisher: DETAILS.publisher,
          series: DETAILS.series,
          volume: DETAILS.volume,
          issueNumber: DETAILS.issueNumber,
          imprint: DETAILS.imprint,
          sortName: DETAILS.sortName,
          title: DETAILS.title,
          storeDate: DETAILS.storeDate,
          coverDate: DETAILS.coverDate
        })
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.saveOne$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = updateComicBook({
        comicBookId: DETAILS.comicBookId,
        comicType: DETAILS.comicType,
        publisher: DETAILS.publisher,
        series: DETAILS.series,
        volume: DETAILS.volume,
        issueNumber: DETAILS.issueNumber,
        imprint: DETAILS.imprint,
        sortName: DETAILS.sortName,
        title: DETAILS.title,
        storeDate: DETAILS.storeDate,
        coverDate: DETAILS.coverDate
      });
      const outcome = updateComicBookFailed();

      actions$ = hot('-a', { a: action });
      comicService.updateOne
        .withArgs({
          comicBookId: DETAILS.comicBookId,
          comicType: DETAILS.comicType,
          publisher: DETAILS.publisher,
          series: DETAILS.series,
          volume: DETAILS.volume,
          issueNumber: DETAILS.issueNumber,
          imprint: DETAILS.imprint,
          sortName: DETAILS.sortName,
          title: DETAILS.title,
          storeDate: DETAILS.storeDate,
          coverDate: DETAILS.coverDate
        })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.saveOne$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('updating page deletion', () => {
    it('fires an action on success', () => {
      const serviceResponse = new HttpResponse({ status: 200 });
      const action = updatePageDeletion({ pages: [PAGE], deleted: DELETED });
      const outcome = pageDeletionUpdated();

      actions$ = hot('-a', { a: action });
      comicService.updatePageDeletion
        .withArgs({ pages: [PAGE], deleted: DELETED })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.updatePageDeletion$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on success', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = updatePageDeletion({ pages: [PAGE], deleted: DELETED });
      const outcome = updatePageDeletionFailed();

      actions$ = hot('-a', { a: action });
      comicService.updatePageDeletion
        .withArgs({
          pages: [PAGE],
          deleted: DELETED
        })
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.updatePageDeletion$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = updatePageDeletion({ pages: [PAGE], deleted: DELETED });
      const outcome = updatePageDeletionFailed();

      actions$ = hot('-a', { a: action });
      comicService.updatePageDeletion
        .withArgs({
          pages: [PAGE],
          deleted: DELETED
        })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.updatePageDeletion$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('saving the page order', () => {
    it('fires an action on success', () => {
      const serviceResponse = new HttpResponse({ status: 200 });
      const action = savePageOrder({
        comicBookId: DETAILS.comicBookId,
        entries: [{ index: 0, filename: PAGE.filename }]
      });
      const outcome = pageOrderSaved();

      actions$ = hot('-a', { a: action });
      comicService.savePageOrder
        .withArgs({
          comicBookId: DETAILS.comicBookId,
          entries: [{ index: 0, filename: PAGE.filename }]
        })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.savePageOrder$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = savePageOrder({
        comicBookId: DETAILS.comicBookId,
        entries: [{ index: 0, filename: PAGE.filename }]
      });
      const outcome = savePageOrderFailed();

      actions$ = hot('-a', { a: action });
      comicService.savePageOrder
        .withArgs({
          comicBookId: DETAILS.comicBookId,
          entries: [{ index: 0, filename: PAGE.filename }]
        })
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.savePageOrder$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = savePageOrder({
        comicBookId: DETAILS.comicBookId,
        entries: [{ index: 0, filename: PAGE.filename }]
      });
      const outcome = savePageOrderFailed();

      actions$ = hot('-a', { a: action });
      comicService.savePageOrder
        .withArgs({
          comicBookId: DETAILS.comicBookId,
          entries: [{ index: 0, filename: PAGE.filename }]
        })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.savePageOrder$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('downloading a comic book', () => {
    it('fires an action on success', () => {
      const serviceResponse = DOWNLOAD_COMIC_BOOK;
      const action = downloadComicBook({
        comicBookId: DETAILS.comicBookId
      });
      const outcome = downloadComicBookSuccess();

      actions$ = hot('-a', { a: action });
      comicService.downloadComicBook
        .withArgs({ comicBookId: DETAILS.comicBookId })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.downloadComicBook$).toBeObservable(expected);
      expect(fileDownloadService.saveFile).toHaveBeenCalledWith({
        document: DOWNLOAD_COMIC_BOOK
      });
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = downloadComicBook({
        comicBookId: DETAILS.comicBookId
      });
      const outcome = downloadComicBookFailure();

      actions$ = hot('-a', { a: action });
      comicService.downloadComicBook
        .withArgs({ comicBookId: DETAILS.comicBookId })
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.downloadComicBook$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = downloadComicBook({
        comicBookId: DETAILS.comicBookId
      });
      const outcome = downloadComicBookFailure();

      actions$ = hot('-a', { a: action });
      comicService.downloadComicBook
        .withArgs({ comicBookId: DETAILS.comicBookId })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.downloadComicBook$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
