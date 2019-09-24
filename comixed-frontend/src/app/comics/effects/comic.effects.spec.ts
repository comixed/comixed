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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';

import { ComicEffects } from './comic.effects';
import { ComicService } from 'app/comics/services/comic.service';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { COMIC_1 } from 'app/comics/models/comic.fixtures';
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
  ComicMetadataCleared,
  ComicPageHashBlockingSet,
  ComicPageSaved,
  ComicSave,
  ComicSaved,
  ComicSaveFailed,
  ComicSavePage,
  ComicSavePageFailed,
  ComicSetPageHashBlocking,
  ComicSetPageHashBlockingFailed
} from 'app/comics/actions/comic.actions';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import objectContaining = jasmine.objectContaining;
import {
  SCAN_TYPE_1,
  SCAN_TYPE_3,
  SCAN_TYPE_5
} from 'app/comics/models/scan-type.fixtures';
import {
  FORMAT_1,
  FORMAT_3,
  FORMAT_5
} from 'app/comics/models/comic-format.fixtures';
import { BACK_COVER, FRONT_COVER } from 'app/comics/models/page-type.fixtures';
import { PAGE_1 } from 'app/comics/models/page.fixtures';
import { PageService } from 'app/comics/services/page.service';

describe('ComicEffects', () => {
  let actions$: Observable<any>;
  let effects: ComicEffects;
  let comicService: jasmine.SpyObj<ComicService>;
  let pageService: jasmine.SpyObj<PageService>;
  let messageService: MessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        ComicEffects,
        provideMockActions(() => actions$),
        {
          provide: ComicService,
          useValue: {
            getIssue: jasmine.createSpy('ComicService.getIssue'),
            getScanTypes: jasmine.createSpy('ComicService.getScanTypes'),
            getFormats: jasmine.createSpy('ComicService.getFormats'),
            getPageTypes: jasmine.createSpy('ComicService.getPageTypes'),
            saveComic: jasmine.createSpy('ComicSave.saveComic'),
            clearMetadata: jasmine.createSpy('ComicService.clearMetadata'),
            deleteComic: jasmine.createSpy('ComicService.deleteComic')
          }
        },
        {
          provide: PageService,
          useValue: {
            savePage: jasmine.createSpy('PageService.savePage'),
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
      const service_response = [SCAN_TYPE_1, SCAN_TYPE_3, SCAN_TYPE_5];
      const action = new ComicGetScanTypes();
      const outcome = new ComicGotScanTypes({ scanTypes: service_response });

      actions$ = hot('-a', { a: action });
      comicService.getScanTypes.and.returnValue(of(service_response));

      const expected = hot('-b', { b: outcome });
      expect(effects.getScanTypes$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const service_response = new HttpErrorResponse({});
      const action = new ComicGetScanTypes();
      const outcome = new ComicGetScanTypesFailed();

      actions$ = hot('-a', { a: action });
      comicService.getScanTypes.and.returnValue(throwError(service_response));

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
      const service_response = [FORMAT_1, FORMAT_3, FORMAT_5];
      const action = new ComicGetFormats();
      const outcome = new ComicGotFormats({ formats: service_response });

      actions$ = hot('-a', { a: action });
      comicService.getFormats.and.returnValue(of(service_response));

      const expected = hot('-b', { b: outcome });
      expect(effects.getFormats$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const service_response = new HttpErrorResponse({});
      const action = new ComicGetFormats();
      const outcome = new ComicGetFormatsFailed();

      actions$ = hot('-a', { a: action });
      comicService.getFormats.and.returnValue(throwError(service_response));

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
      const service_response = [FRONT_COVER, BACK_COVER];
      const action = new ComicGetPageTypes();
      const outcome = new ComicGotPageTypes({ pageTypes: service_response });

      actions$ = hot('-a', { a: action });
      comicService.getPageTypes.and.returnValue(of(service_response));

      const expected = hot('-b', { b: outcome });
      expect(effects.getPageTypes$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const service_response = new HttpErrorResponse({});
      const action = new ComicGetPageTypes();
      const outcome = new ComicGetPageTypesFailed();

      actions$ = hot('-a', { a: action });
      comicService.getPageTypes.and.returnValue(throwError(service_response));

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
      const service_response = COMIC_1;
      const action = new ComicGetIssue({ id: 29 });
      const outcome = new ComicGotIssue({ comic: service_response });

      actions$ = hot('-a', { a: action });
      comicService.getIssue.and.returnValue(of(service_response));

      const expected = hot('-b', { b: outcome });
      expect(effects.getIssue$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const service_response = new HttpErrorResponse({});
      const action = new ComicGetIssue({ id: 29 });
      const outcome = new ComicGetIssueFailed();

      actions$ = hot('-a', { a: action });
      comicService.getIssue.and.returnValue(throwError(service_response));

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
      const service_response = COMIC_1;
      const action = new ComicSavePage({ page: PAGE_1 });
      const outcome = new ComicPageSaved({ comic: service_response });

      actions$ = hot('-a', { a: action });
      pageService.savePage.and.returnValue(of(service_response));

      const expected = hot('-b', { b: outcome });
      expect(effects.savePage$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'info' })
      );
    });

    it('fires an action on service failure', () => {
      const service_response = new HttpErrorResponse({});
      const action = new ComicSavePage({ page: PAGE_1 });
      const outcome = new ComicSavePageFailed();

      actions$ = hot('-a', { a: action });
      pageService.savePage.and.returnValue(throwError(service_response));

      const expected = hot('-b', { b: outcome });
      expect(effects.savePage$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });

    it('fires an action on general failure', () => {
      const action = new ComicSavePage({ page: PAGE_1 });
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

  describe('when setting the blocked state for a page hash', () => {
    it('fires an action on success', () => {
      const service_response = COMIC_1;
      const action = new ComicSetPageHashBlocking({
        page: PAGE_1,
        state: true
      });
      const outcome = new ComicPageHashBlockingSet({ comic: service_response });

      actions$ = hot('-a', { a: action });
      pageService.setPageHashBlocking.and.returnValue(of(service_response));

      const expected = hot('-b', { b: outcome });
      expect(effects.setPageHashBlocking$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'info' })
      );
    });

    it('fires an action on service failure', () => {
      const service_response = new HttpErrorResponse({});
      const action = new ComicSetPageHashBlocking({
        page: PAGE_1,
        state: true
      });
      const outcome = new ComicSetPageHashBlockingFailed();

      actions$ = hot('-a', { a: action });
      pageService.setPageHashBlocking.and.returnValue(
        throwError(service_response)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.setPageHashBlocking$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });

    it('fires an action on general failure', () => {
      const action = new ComicSetPageHashBlocking({
        page: PAGE_1,
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
      const service_response = COMIC_1;
      const action = new ComicSave({ comic: COMIC_1 });
      const outcome = new ComicSaved({ comic: service_response });

      actions$ = hot('-a', { a: action });
      comicService.saveComic.and.returnValue(of(service_response));

      const expected = hot('-b', { b: outcome });
      expect(effects.saveComic$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'info' })
      );
    });

    it('fires an action on service failure', () => {
      const service_response = new HttpErrorResponse({});
      const action = new ComicSave({ comic: COMIC_1 });
      const outcome = new ComicSaveFailed();

      actions$ = hot('-a', { a: action });
      comicService.saveComic.and.returnValue(throwError(service_response));

      const expected = hot('-b', { b: outcome });
      expect(effects.saveComic$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });

    it('fires an action on general failure', () => {
      const action = new ComicSave({ comic: COMIC_1 });
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
      const service_response = COMIC_1;
      const action = new ComicClearMetadata({ comic: COMIC_1 });
      const outcome = new ComicMetadataCleared({ comic: service_response });

      actions$ = hot('-a', { a: action });
      comicService.clearMetadata.and.returnValue(of(service_response));

      const expected = hot('-b', { b: outcome });
      expect(effects.clearMetadata$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'info' })
      );
    });

    it('fires an action on service failure', () => {
      const service_response = new HttpErrorResponse({});
      const action = new ComicClearMetadata({ comic: COMIC_1 });
      const outcome = new ComicClearMetadataFailed();

      actions$ = hot('-a', { a: action });
      comicService.clearMetadata.and.returnValue(throwError(service_response));

      const expected = hot('-b', { b: outcome });
      expect(effects.clearMetadata$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });

    it('fires an action on general failure', () => {
      const action = new ComicClearMetadata({ comic: COMIC_1 });
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
      const service_response = new HttpResponse({});
      const action = new ComicDelete({ comic: COMIC_1 });
      const outcome = new ComicDeleted();

      actions$ = hot('-a', { a: action });
      comicService.deleteComic.and.returnValue(of(service_response));

      const expected = hot('-b', { b: outcome });
      expect(effects.deleteComic$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'info' })
      );
    });

    it('fires an action on service failure', () => {
      const service_response = new HttpErrorResponse({});
      const action = new ComicDelete({ comic: COMIC_1 });
      const outcome = new ComicDeleteFailed();

      actions$ = hot('-a', { a: action });
      comicService.deleteComic.and.returnValue(throwError(service_response));

      const expected = hot('-b', { b: outcome });
      expect(effects.deleteComic$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });

    it('fires an action on general failure', () => {
      const action = new ComicDelete({ comic: COMIC_1 });
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
});
