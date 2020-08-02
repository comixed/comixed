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

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { EffectsModule } from '@ngrx/effects';
import { Store, StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { AppState } from 'app/comics';
import {
  ComicClearMetadata,
  ComicDelete,
  ComicDeleted,
  ComicGetFormats,
  ComicGetIssue,
  ComicGetIssueFailed,
  ComicGetPageTypes,
  ComicGetScanTypes,
  ComicGotFormats,
  ComicGotIssue,
  ComicGotPageTypes,
  ComicGotScanTypes,
  ComicMarkAsRead,
  ComicMarkAsReadFailed,
  ComicMarkedAsRead,
  ComicPageDeletedSet,
  ComicPageTypeSet,
  ComicRestore,
  ComicRestored,
  ComicRestoreFailed,
  ComicSave,
  ComicSavePage,
  ComicSetPageDeleted,
  ComicSetPageDeletedFailed,
  ComicSetPageHashBlocking,
  ComicSetPageType,
  ComicSetPageTypeFailed
} from 'app/comics/actions/comic.actions';
import { ComicEffects } from 'app/comics/effects/comic.effects';
import {
  FORMAT_1,
  FORMAT_3,
  FORMAT_5
} from 'app/comics/models/comic-format.fixtures';
import { COMIC_1 } from 'app/comics/models/comic.fixtures';
import { FRONT_COVER } from 'app/comics/models/page-type.fixtures';
import {
  SCAN_TYPE_1,
  SCAN_TYPE_3,
  SCAN_TYPE_5
} from 'app/comics/models/scan-type.fixtures';
import * as fromComics from 'app/comics/reducers/comic.reducer';
import { MessageService } from 'primeng/api';
import { ComicAdaptor } from './comic.adaptor';
import { LoggerModule } from '@angular-ru/logger';
import { COMIC_1_LAST_READ_DATE } from 'app/library/models/last-read-date.fixtures';

describe('ComicAdaptor', () => {
  const SCAN_TYPES = [SCAN_TYPE_1, SCAN_TYPE_3, SCAN_TYPE_5];
  const FORMATS = [FORMAT_1, FORMAT_3, FORMAT_5];
  const COMIC = COMIC_1;
  const SKIP_CACHE = false;
  const LAST_READ_DATE = COMIC_1_LAST_READ_DATE;
  const PAGE = COMIC.pages[1];
  const PAGE_TYPE = FRONT_COVER;

  let adaptor: ComicAdaptor;
  let store: Store<AppState>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        LoggerModule.forRoot(),
        StoreModule.forRoot({}),
        StoreModule.forFeature(
          fromComics.COMIC_FEATURE_KEY,
          fromComics.reducer
        ),
        EffectsModule.forRoot([]),
        EffectsModule.forFeature([ComicEffects])
      ],
      providers: [ComicAdaptor, MessageService]
    });

    adaptor = TestBed.get(ComicAdaptor);
    store = TestBed.get(Store);
    spyOn(store, 'dispatch').and.callThrough();
  });

  it('should create an instance', () => {
    expect(adaptor).toBeTruthy();
  });

  describe('loading scan types', () => {
    it('can load the scan types', () => {
      adaptor.getScanTypes();
      expect(store.dispatch).toHaveBeenCalledWith(new ComicGetScanTypes());
    });

    it('only retrieves the scan types once', () => {
      store.dispatch(new ComicGotScanTypes({ scanTypes: SCAN_TYPES }));
      adaptor.getScanTypes();
      expect(store.dispatch).not.toHaveBeenCalledWith(new ComicGetScanTypes());
    });

    describe('when the scan types are received', () => {
      beforeEach(() => {
        store.dispatch(new ComicGotScanTypes({ scanTypes: SCAN_TYPES }));
      });

      it('provides notice when the scan types are loaded', () => {
        adaptor.scanTypesLoaded$.subscribe(result =>
          expect(result).toBeTruthy()
        );
      });

      it('provides notice when the scan types are changed', () => {
        adaptor.scanTypes$.subscribe(result =>
          expect(result).toEqual(SCAN_TYPES)
        );
      });
    });
  });

  describe('loading the comic formats', () => {
    it('can load the comic formats', () => {
      adaptor.getFormats();
      expect(store.dispatch).toHaveBeenCalledWith(new ComicGetFormats());
    });

    it('only retrieves the scan types once', () => {
      store.dispatch(new ComicGotFormats({ formats: FORMATS }));
      adaptor.getFormats();
      expect(store.dispatch).not.toHaveBeenCalledWith(new ComicGetFormats());
    });

    describe('when the formats are received', () => {
      beforeEach(() => {
        store.dispatch(new ComicGotFormats({ formats: FORMATS }));
      });

      it('provides notice when the formats are loaded', () => {
        adaptor.formatsLoaded$.subscribe(result => expect(result).toBeTruthy());
      });

      it('provides notice when the formats are changed', () => {
        adaptor.formats$.subscribe(result => expect(result).toEqual(FORMATS));
      });
    });
  });

  it('provides notice when fetching page types', () => {
    store.dispatch(new ComicGetPageTypes());
    adaptor.fetchingPageTypes$.subscribe(result => expect(result).toBeTruthy());
  });

  describe('loading page types', () => {
    const PAGE_TYPES = [FRONT_COVER];

    beforeEach(() => {
      store.dispatch(new ComicGotPageTypes({ pageTypes: PAGE_TYPES }));
    });

    it('provides notice when the the page types are loaded', () => {
      adaptor.pageTypesLoaded$.subscribe(result => expect(result).toBeTruthy());
    });

    it('provides notice when the page types change', () => {
      adaptor.pageTypes$.subscribe(result =>
        expect(result).toEqual(PAGE_TYPES)
      );
    });
  });

  describe('fetching a single comic', () => {
    beforeEach(() => {
      adaptor.getComicById(COMIC.id);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        new ComicGetIssue({ id: COMIC.id })
      );
    });

    it('provides updates on fetching', () => {
      adaptor.fetchingIssue$.subscribe(response =>
        expect(response).toBeTruthy()
      );
    });

    it('provides updates on no comic', () => {
      adaptor.noComic$.subscribe(response => expect(response).toBeFalsy());
    });

    describe('success', () => {
      beforeEach(() => {
        store.dispatch(new ComicGotIssue({ comic: COMIC }));
      });

      it('provides updates on fetching', () => {
        adaptor.fetchingIssue$.subscribe(response =>
          expect(response).toBeFalsy()
        );
      });

      it('provides updates on the comic', () => {
        adaptor.comic$.subscribe(result => expect(result).toEqual(COMIC));
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        store.dispatch(new ComicGetIssueFailed());
      });

      it('provides updates on fetching', () => {
        adaptor.fetchingIssue$.subscribe(response =>
          expect(response).toBeFalsy()
        );
      });

      it('provides updates on no comic', () => {
        adaptor.noComic$.subscribe(response => expect(response).toBeTruthy());
      });
    });
  });

  it('can save changes to a page', () => {
    adaptor.savePage(PAGE);
    expect(store.dispatch).toHaveBeenCalledWith(
      new ComicSavePage({ page: PAGE })
    );
  });

  it('can block a page hash', () => {
    adaptor.blockPageHash(PAGE);
    expect(store.dispatch).toHaveBeenCalledWith(
      new ComicSetPageHashBlocking({ page: PAGE, state: true })
    );
  });

  it('can unblock a page hash', () => {
    adaptor.unblockPageHash(PAGE);
    expect(store.dispatch).toHaveBeenCalledWith(
      new ComicSetPageHashBlocking({ page: PAGE, state: false })
    );
  });

  describe('can change the page type', () => {
    beforeEach(() => {
      store.dispatch(new ComicGotIssue({ comic: COMIC }));
      adaptor.setPageType(PAGE, PAGE_TYPE);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        new ComicSetPageType({ page: PAGE, pageType: PAGE_TYPE })
      );
    });

    it('provides updates on setting the page type', () => {
      adaptor.settingPageType$.subscribe(response =>
        expect(response).toBeTruthy()
      );
    });

    describe('success', () => {
      beforeEach(() => {
        store.dispatch(new ComicPageTypeSet({ page: PAGE }));
      });

      it('provides updates on setting the page type', () => {
        adaptor.settingPageType$.subscribe(response =>
          expect(response).toBeFalsy()
        );
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        store.dispatch(new ComicSetPageTypeFailed());
      });

      it('provides updates on setting the page type', () => {
        adaptor.settingPageType$.subscribe(response =>
          expect(response).toBeFalsy()
        );
      });
    });
  });

  it('can save a comic', () => {
    adaptor.saveComic(COMIC);
    expect(store.dispatch).toHaveBeenCalledWith(
      new ComicSave({ comic: COMIC })
    );
  });

  it('can clear the metadata from a comic', () => {
    adaptor.clearMetadata(COMIC);
    expect(store.dispatch).toHaveBeenCalledWith(
      new ComicClearMetadata({ comic: COMIC })
    );
  });

  describe('deleting a comic', () => {
    beforeEach(() => {
      adaptor.deleteComic(COMIC);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        new ComicDelete({ comic: COMIC })
      );
    });

    it('provides updates on deleting', () => {
      adaptor.deletingComic$.subscribe(response =>
        expect(response).toBeTruthy()
      );
    });

    describe('when the comic is deleted', () => {
      const UPDATED_COMIC = { ...COMIC, deletedDate: new Date().getTime() };

      beforeEach(() => {
        store.dispatch(new ComicDeleted({ comic: UPDATED_COMIC }));
      });

      it('provides updates on deleting', () => {
        adaptor.deletingComic$.subscribe(response =>
          expect(response).toBeFalsy()
        );
      });

      it('updates the comic', () => {
        adaptor.comic$.subscribe(response =>
          expect(response).toEqual(UPDATED_COMIC)
        );
      });
    });

    describe('restoring a comic', () => {
      const COMIC_TO_RESTORE = { ...COMIC, deletedDate: new Date().getTime() };

      beforeEach(() => {
        adaptor.restoreComic(COMIC_TO_RESTORE);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          new ComicRestore({ comic: COMIC_TO_RESTORE })
        );
      });

      it('provides updates on restoring', () => {
        adaptor.restoringComic$.subscribe(response =>
          expect(response).toBeTruthy()
        );
      });

      describe('when the comic is restored', () => {
        const UPDATED_COMIC = COMIC;

        beforeEach(() => {
          store.dispatch(new ComicRestored({ comic: UPDATED_COMIC }));
        });

        it('provides updates on restoring', () => {
          adaptor.restoringComic$.subscribe(response =>
            expect(response).toBeFalsy()
          );
        });

        it('updates the comic', () => {
          adaptor.comic$.subscribe(response =>
            expect(response).toEqual(UPDATED_COMIC)
          );
        });
      });
    });

    describe('when the restore fails', () => {
      beforeEach(() => {
        store.dispatch(new ComicRestoreFailed());
      });

      it('provides updates on restoring', () => {
        adaptor.restoringComic$.subscribe(response =>
          expect(response).toBeFalsy()
        );
      });
    });
  });

  describe('marking a comic as read', () => {
    beforeEach(() => {
      store.dispatch(
        new ComicGotIssue({ comic: { ...COMIC, lastRead: null } })
      );
      adaptor.markAsRead(COMIC);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        new ComicMarkAsRead({ comic: COMIC, read: true })
      );
    });

    it('provides updates on marking the comic', () => {
      adaptor.markingAsRead$.subscribe(response =>
        expect(response).toBeTruthy()
      );
    });

    describe('success', () => {
      beforeEach(() => {
        store.dispatch(
          new ComicMarkedAsRead({ lastRead: LAST_READ_DATE.lastRead })
        );
      });

      it('provides updates on marking the comic', () => {
        adaptor.markingAsRead$.subscribe(response =>
          expect(response).toBeFalsy()
        );
      });

      it('provides updates on the comic', () => {
        adaptor.comic$.subscribe(response =>
          expect(response).toEqual({
            ...COMIC,
            lastRead: LAST_READ_DATE.lastRead
          })
        );
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        store.dispatch(new ComicMarkAsReadFailed());
      });

      it('provides updates on marking the comic', () => {
        adaptor.markingAsRead$.subscribe(response =>
          expect(response).toBeFalsy()
        );
      });

      it('provides updates on the comic', () => {
        adaptor.comic$.subscribe(response =>
          expect(response.lastRead).toBeNull()
        );
      });
    });
  });

  describe('marking a comic as not read', () => {
    beforeEach(() => {
      store.dispatch(
        new ComicGotIssue({
          comic: { ...COMIC, lastRead: LAST_READ_DATE.lastRead }
        })
      );
      adaptor.markAsUnread(COMIC);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        new ComicMarkAsRead({ comic: COMIC, read: false })
      );
    });

    it('provides updates on marking the comic', () => {
      adaptor.markingAsRead$.subscribe(response =>
        expect(response).toBeTruthy()
      );
    });

    describe('success', () => {
      beforeEach(() => {
        store.dispatch(new ComicMarkedAsRead({ lastRead: null }));
      });

      it('provides updates on marking the comic', () => {
        adaptor.markingAsRead$.subscribe(response =>
          expect(response).toBeFalsy()
        );
      });

      it('provides updates on the comic', () => {
        adaptor.comic$.subscribe(response =>
          expect(response).toEqual({
            ...COMIC,
            lastRead: null
          })
        );
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        store.dispatch(new ComicMarkAsReadFailed());
      });

      it('provides updates on marking the comic', () => {
        adaptor.markingAsRead$.subscribe(response =>
          expect(response).toBeFalsy()
        );
      });

      it('provides updates on the comic', () => {
        adaptor.comic$.subscribe(response =>
          expect(response.lastRead).toEqual(LAST_READ_DATE.lastRead)
        );
      });
    });
  });

  describe('deleting a page', () => {
    beforeEach(() => {
      adaptor.deletePage(PAGE);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        new ComicSetPageDeleted({ page: PAGE, deleted: true })
      );
    });

    it('provides updates on deleting', () => {
      adaptor.deletingPage$.subscribe(response =>
        expect(response).toBeTruthy()
      );
    });

    describe('success', () => {
      beforeEach(() => {
        store.dispatch(new ComicPageDeletedSet({ comic: COMIC }));
      });

      it('provides updates on deleting', () => {
        adaptor.deletingPage$.subscribe(response =>
          expect(response).toBeFalsy()
        );
      });

      it('updates the comic', () => {
        adaptor.comic$.subscribe(response => expect(response).toEqual(COMIC));
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        store.dispatch(new ComicSetPageDeletedFailed());
      });

      it('provides updates on deleting', () => {
        adaptor.deletingPage$.subscribe(response =>
          expect(response).toBeFalsy()
        );
      });
    });
  });

  describe('undeleting a page', () => {
    beforeEach(() => {
      adaptor.undeletePage(PAGE);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        new ComicSetPageDeleted({ page: PAGE, deleted: false })
      );
    });

    it('provides updates on deleting', () => {
      adaptor.deletingPage$.subscribe(response =>
        expect(response).toBeTruthy()
      );
    });

    describe('success', () => {
      beforeEach(() => {
        store.dispatch(new ComicPageDeletedSet({ comic: COMIC }));
      });

      it('provides updates on deleting', () => {
        adaptor.deletingPage$.subscribe(response =>
          expect(response).toBeFalsy()
        );
      });

      it('updates the comic', () => {
        adaptor.comic$.subscribe(response => expect(response).toEqual(COMIC));
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        store.dispatch(new ComicSetPageDeletedFailed());
      });

      it('provides updates on deleting', () => {
        adaptor.deletingPage$.subscribe(response =>
          expect(response).toBeFalsy()
        );
      });
    });
  });
});
