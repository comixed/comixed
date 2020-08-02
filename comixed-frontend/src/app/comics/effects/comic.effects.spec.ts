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

import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { TranslateModule } from '@ngx-translate/core';
import {
  ComicClearMetadata,
  ComicClearMetadataFailed,
  ComicDelete,
  ComicDeleted,
  ComicDeleteFailed,
  ComicGetFormats,
  ComicGetFormatsFailed,
  ComicGetIssue,
  ComicGetIssueFailed,
  ComicGetPageTypes,
  ComicGetPageTypesFailed,
  ComicGetScanTypes,
  ComicGetScanTypesFailed,
  ComicGotFormats,
  ComicGotIssue,
  ComicGotPageTypes,
  ComicGotScanTypes,
  ComicMarkAsRead,
  ComicMarkAsReadFailed,
  ComicMarkedAsRead,
  ComicMetadataCleared,
  ComicPageDeletedSet,
  ComicPageHashBlockingSet,
  ComicPageSaved,
  ComicPageTypeSet,
  ComicRestore,
  ComicRestored,
  ComicRestoreFailed,
  ComicSave,
  ComicSaved,
  ComicSaveFailed,
  ComicSavePage,
  ComicSavePageFailed,
  ComicSetPageDeleted,
  ComicSetPageDeletedFailed,
  ComicSetPageHashBlocking,
  ComicSetPageHashBlockingFailed,
  ComicSetPageType,
  ComicSetPageTypeFailed
} from 'app/comics/actions/comic.actions';
import {
  FORMAT_1,
  FORMAT_3,
  FORMAT_5
} from 'app/comics/models/comic-format.fixtures';
import { COMIC_1 } from 'app/comics/models/comic.fixtures';
import {
  BACK_COVER,
  FRONT_COVER,
  STORY
} from 'app/comics/models/page-type.fixtures';
import { PAGE_1 } from 'app/comics/models/page.fixtures';
import {
  SCAN_TYPE_1,
  SCAN_TYPE_3,
  SCAN_TYPE_5
} from 'app/comics/models/scan-type.fixtures';
import { ComicService } from 'app/comics/services/comic.service';
import { PageService } from 'app/comics/services/page.service';
import { hot } from 'jasmine-marbles';
import { MessageService } from 'primeng/api';
import { Observable, of, throwError } from 'rxjs';

import { ComicEffects } from './comic.effects';
import { COMIC_1_LAST_READ_DATE } from 'app/library/models/last-read-date.fixtures';
import { LoggerModule } from '@angular-ru/logger';
import objectContaining = jasmine.objectContaining;

describe('ComicEffects', () => {
  const COMIC = COMIC_1;
  const SKIP_CACHE = false;
  const LAST_READ_DATE = COMIC_1_LAST_READ_DATE;
  const PAGE = PAGE_1;
  const PAGE_TYPE = STORY;

  let actions$: Observable<any>;
  let effects: ComicEffects;
  let comicService: jasmine.SpyObj<ComicService>;
  let pageService: jasmine.SpyObj<PageService>;
  let messageService: MessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), LoggerModule.forRoot()],
      providers: [
        ComicEffects,
        provideMockActions(() => actions$),
        {
          provide: ComicService,
          useValue: {
            getIssue: jasmine.createSpy('ComicService.getIssue()'),
            getScanTypes: jasmine.createSpy('ComicService.getScanTypes()'),
            getFormats: jasmine.createSpy('ComicService.getFormats()'),
            getPageTypes: jasmine.createSpy('ComicService.getPageTypes()'),
            saveComic: jasmine.createSpy('ComicSave.saveComic()'),
            clearMetadata: jasmine.createSpy('ComicService.clearMetadata()'),
            deleteComic: jasmine.createSpy('ComicService.deleteComic()'),
            restoreComic: jasmine.createSpy('ComicService.restoreComic()'),
            scrapeComic: jasmine.createSpy('ComicService.scrapeComic()'),
            markAsRead: jasmine.createSpy('ComicService.markAsRead()'),
            deletePage: jasmine.createSpy('ComicService.deletePage()')
          }
        },
        {
          provide: PageService,
          useValue: {
            savePage: jasmine.createSpy('PageService.savePage'),
            setPageType: jasmine.createSpy('PageService.setPageType'),
            setPageHashBlocking: jasmine.createSpy(
              'PageService.setPageHashBlocking'
            )
          }
        },
        MessageService
      ]
    });

    effects = TestBed.get(ComicEffects);
    comicService = TestBed.get(ComicService);
    pageService = TestBed.get(PageService);
    messageService = TestBed.get(MessageService);
    spyOn(messageService, 'add');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('when getting the scan types', () => {
    it('fires an action on success', () => {
      const serviceResponse = [SCAN_TYPE_1, SCAN_TYPE_3, SCAN_TYPE_5];
      const action = new ComicGetScanTypes();
      const outcome = new ComicGotScanTypes({ scanTypes: serviceResponse });

      actions$ = hot('-a', { a: action });
      comicService.getScanTypes.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.getScanTypes$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = new ComicGetScanTypes();
      const outcome = new ComicGetScanTypesFailed();

      actions$ = hot('-a', { a: action });
      comicService.getScanTypes.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.getScanTypes$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });

    it('fires an action on general failure', () => {
      const action = new ComicGetScanTypes();
      const outcome = new ComicGetScanTypesFailed();

      actions$ = hot('-a', { a: action });
      comicService.getScanTypes.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.getScanTypes$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });
  });

  describe('when getting the formats', () => {
    it('fires an action on success', () => {
      const serviceResponse = [FORMAT_1, FORMAT_3, FORMAT_5];
      const action = new ComicGetFormats();
      const outcome = new ComicGotFormats({ formats: serviceResponse });

      actions$ = hot('-a', { a: action });
      comicService.getFormats.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.getFormats$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = new ComicGetFormats();
      const outcome = new ComicGetFormatsFailed();

      actions$ = hot('-a', { a: action });
      comicService.getFormats.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.getFormats$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });

    it('fires an action on general failure', () => {
      const action = new ComicGetFormats();
      const outcome = new ComicGetFormatsFailed();

      actions$ = hot('-a', { a: action });
      comicService.getFormats.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.getFormats$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });
  });

  describe('when getting the page types', () => {
    it('fires an action on success', () => {
      const serviceResponse = [FRONT_COVER, BACK_COVER];
      const action = new ComicGetPageTypes();
      const outcome = new ComicGotPageTypes({ pageTypes: serviceResponse });

      actions$ = hot('-a', { a: action });
      comicService.getPageTypes.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.getPageTypes$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = new ComicGetPageTypes();
      const outcome = new ComicGetPageTypesFailed();

      actions$ = hot('-a', { a: action });
      comicService.getPageTypes.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.getPageTypes$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });

    it('fires an action on general failure', () => {
      const action = new ComicGetPageTypes();
      const outcome = new ComicGetPageTypesFailed();

      actions$ = hot('-a', { a: action });
      comicService.getPageTypes.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.getPageTypes$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });
  });

  describe('when getting a comic', () => {
    it('fires an action on success', () => {
      const serviceResponse = COMIC;
      const action = new ComicGetIssue({ id: 29 });
      const outcome = new ComicGotIssue({ comic: serviceResponse });

      actions$ = hot('-a', { a: action });
      comicService.getIssue.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.getIssue$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = new ComicGetIssue({ id: 29 });
      const outcome = new ComicGetIssueFailed();

      actions$ = hot('-a', { a: action });
      comicService.getIssue.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.getIssue$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });

    it('fires an action on general failure', () => {
      const action = new ComicGetIssue({ id: 29 });
      const outcome = new ComicGetIssueFailed();

      actions$ = hot('-a', { a: action });
      comicService.getIssue.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.getIssue$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });
  });

  describe('when saving a page', () => {
    it('fires an action on success', () => {
      const serviceResponse = COMIC;
      const action = new ComicSavePage({ page: PAGE });
      const outcome = new ComicPageSaved({ comic: serviceResponse });

      actions$ = hot('-a', { a: action });
      pageService.savePage.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.savePage$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'info' })
      );
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = new ComicSavePage({ page: PAGE });
      const outcome = new ComicSavePageFailed();

      actions$ = hot('-a', { a: action });
      pageService.savePage.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.savePage$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });

    it('fires an action on general failure', () => {
      const action = new ComicSavePage({ page: PAGE });
      const outcome = new ComicSavePageFailed();

      actions$ = hot('-a', { a: action });
      pageService.savePage.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.savePage$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });
  });

  describe('when setting the page type', () => {
    it('fires an action on success', () => {
      const serviceResponse = PAGE;
      const action = new ComicSetPageType({
        page: PAGE,
        pageType: PAGE_TYPE
      });
      const outcome = new ComicPageTypeSet({ page: PAGE });

      actions$ = hot('-a', { a: action });
      pageService.setPageType.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.setPageType$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'info' })
      );
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = new ComicSetPageType({
        page: PAGE,
        pageType: PAGE_TYPE
      });
      const outcome = new ComicSetPageTypeFailed();

      actions$ = hot('-a', { a: action });
      pageService.setPageType.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.setPageType$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });

    it('fires an action on general failure', () => {
      const action = new ComicSetPageType({
        page: PAGE,
        pageType: PAGE_TYPE
      });
      const outcome = new ComicSetPageTypeFailed();

      actions$ = hot('-a', { a: action });
      pageService.setPageType.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.setPageType$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });
  });

  describe('when setting the blocked state for a page hash', () => {
    it('fires an action on success', () => {
      const serviceResponse = COMIC;
      const action = new ComicSetPageHashBlocking({
        page: PAGE,
        state: true
      });
      const outcome = new ComicPageHashBlockingSet({ comic: serviceResponse });

      actions$ = hot('-a', { a: action });
      pageService.setPageHashBlocking.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.setPageHashBlocking$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'info' })
      );
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = new ComicSetPageHashBlocking({
        page: PAGE,
        state: true
      });
      const outcome = new ComicSetPageHashBlockingFailed();

      actions$ = hot('-a', { a: action });
      pageService.setPageHashBlocking.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.setPageHashBlocking$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });

    it('fires an action on general failure', () => {
      const action = new ComicSetPageHashBlocking({
        page: PAGE,
        state: true
      });
      const outcome = new ComicSetPageHashBlockingFailed();

      actions$ = hot('-a', { a: action });
      pageService.setPageHashBlocking.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.setPageHashBlocking$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });
  });

  describe('when saving a comic', () => {
    it('fires an action on success', () => {
      const serviceResponse = COMIC;
      const action = new ComicSave({ comic: COMIC });
      const outcome = new ComicSaved({ comic: serviceResponse });

      actions$ = hot('-a', { a: action });
      comicService.saveComic.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.saveComic$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'info' })
      );
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = new ComicSave({ comic: COMIC });
      const outcome = new ComicSaveFailed();

      actions$ = hot('-a', { a: action });
      comicService.saveComic.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.saveComic$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });

    it('fires an action on general failure', () => {
      const action = new ComicSave({ comic: COMIC });
      const outcome = new ComicSaveFailed();

      actions$ = hot('-a', { a: action });
      comicService.saveComic.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.saveComic$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });
  });

  describe('when clearing the metadata for a comic', () => {
    it('fires an action on success', () => {
      const serviceResponse = COMIC;
      const action = new ComicClearMetadata({ comic: COMIC });
      const outcome = new ComicMetadataCleared({ comic: serviceResponse });

      actions$ = hot('-a', { a: action });
      comicService.clearMetadata.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.clearMetadata$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'info' })
      );
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = new ComicClearMetadata({ comic: COMIC });
      const outcome = new ComicClearMetadataFailed();

      actions$ = hot('-a', { a: action });
      comicService.clearMetadata.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.clearMetadata$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });

    it('fires an action on general failure', () => {
      const action = new ComicClearMetadata({ comic: COMIC });
      const outcome = new ComicClearMetadataFailed();

      actions$ = hot('-a', { a: action });
      comicService.clearMetadata.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.clearMetadata$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });
  });

  describe('when deleting a comic', () => {
    it('fires an action on success', () => {
      const serviceResponse = COMIC;
      const action = new ComicDelete({ comic: COMIC });
      const outcome = new ComicDeleted({ comic: serviceResponse });

      actions$ = hot('-a', { a: action });
      comicService.deleteComic.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.deleteComic$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'info' })
      );
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = new ComicDelete({ comic: COMIC });
      const outcome = new ComicDeleteFailed();

      actions$ = hot('-a', { a: action });
      comicService.deleteComic.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.deleteComic$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });

    it('fires an action on general failure', () => {
      const action = new ComicDelete({ comic: COMIC });
      const outcome = new ComicDeleteFailed();

      actions$ = hot('-a', { a: action });
      comicService.deleteComic.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.deleteComic$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });
  });

  describe('when restoring a comic', () => {
    it('fires an action on success', () => {
      const serviceResponse = COMIC;
      const action = new ComicRestore({ comic: COMIC });
      const outcome = new ComicRestored({ comic: serviceResponse });

      actions$ = hot('-a', { a: action });
      comicService.restoreComic.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.restoreComic$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'info' })
      );
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = new ComicRestore({ comic: COMIC });
      const outcome = new ComicRestoreFailed();

      actions$ = hot('-a', { a: action });
      comicService.restoreComic.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.restoreComic$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });

    it('fires an action on general failure', () => {
      const action = new ComicRestore({ comic: COMIC });
      const outcome = new ComicRestoreFailed();

      actions$ = hot('-a', { a: action });
      comicService.restoreComic.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.restoreComic$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });
  });

  describe('when marking a comic as read', () => {
    it('fires an action on success', () => {
      const serviceResponse = LAST_READ_DATE;
      const action = new ComicMarkAsRead({ comic: COMIC, read: true });
      const outcome = new ComicMarkedAsRead({
        lastRead: serviceResponse.lastRead
      });

      actions$ = hot('-a', { a: action });
      comicService.markAsRead.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.markAsRead$).toBeObservable(expected);
      // expect(messageService.add).toHaveBeenCalledWith(
      //   objectContaining({ severity: 'info' })
      // );
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = new ComicMarkAsRead({ comic: COMIC, read: true });
      const outcome = new ComicMarkAsReadFailed();

      actions$ = hot('-a', { a: action });
      comicService.markAsRead.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.markAsRead$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });

    it('fires an action on general failure', () => {
      const action = new ComicMarkAsRead({ comic: COMIC, read: true });
      const outcome = new ComicMarkAsReadFailed();

      actions$ = hot('-a', { a: action });
      comicService.markAsRead.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.markAsRead$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });
  });

  describe('when unmarking a comic as read', () => {
    it('fires an action on success', () => {
      const serviceResponse = true;
      const action = new ComicMarkAsRead({ comic: COMIC, read: false });
      const outcome = new ComicMarkedAsRead({ lastRead: null });

      actions$ = hot('-a', { a: action });
      comicService.markAsRead.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.markAsRead$).toBeObservable(expected);
      // expect(messageService.add).toHaveBeenCalledWith(
      //   objectContaining({ severity: 'info' })
      // );
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = new ComicMarkAsRead({ comic: COMIC, read: false });
      const outcome = new ComicMarkAsReadFailed();

      actions$ = hot('-a', { a: action });
      comicService.markAsRead.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.markAsRead$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });

    it('fires an action on general failure', () => {
      const action = new ComicMarkAsRead({ comic: COMIC, read: false });
      const outcome = new ComicMarkAsReadFailed();

      actions$ = hot('-a', { a: action });
      comicService.markAsRead.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.markAsRead$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });
  });

  describe('deleting a page', () => {
    const DELETED = Math.random() < 0.5;

    it('fires an action on success', () => {
      const serviceResponse = COMIC;
      const action = new ComicSetPageDeleted({ page: PAGE, deleted: DELETED });
      const outcome = new ComicPageDeletedSet({ comic: COMIC });

      actions$ = hot('-a', { a: action });
      comicService.deletePage.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.deletePage$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'info' })
      );
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = new ComicSetPageDeleted({ page: PAGE, deleted: DELETED });
      const outcome = new ComicSetPageDeletedFailed();

      actions$ = hot('-a', { a: action });
      comicService.deletePage.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.deletePage$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });

    it('fires an action on general failure', () => {
      const action = new ComicSetPageDeleted({ page: PAGE, deleted: DELETED });
      const outcome = new ComicSetPageDeletedFailed();

      actions$ = hot('-a', { a: action });
      comicService.deletePage.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.deletePage$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });
  });
});
