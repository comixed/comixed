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

import {
  ComicSetPageDeletedFailed,
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
import { ComicState, initialState, reducer } from './comic.reducer';
import { COMIC_1_LAST_READ_DATE } from 'app/library/models/last-read-date.fixtures';
import { Page } from 'app/comics';

describe('Comic Reducer', () => {
  const COMIC = COMIC_1;
  const LAST_READ_DATE = COMIC_1_LAST_READ_DATE;
  const PAGE = COMIC.pages[1];
  const PAGE_TYPE = STORY;

  let state: ComicState;

  beforeEach(() => {
    state = initialState;
  });

  describe('by default', () => {
    beforeEach(() => {
      state = reducer(state, {} as any);
    });

    it('clears the fetching scan types flag', () => {
      expect(state.fetchingScanTypes).toBeFalsy();
    });

    it('clears the set of scan types', () => {
      expect(state.scanTypes).toEqual([]);
    });

    it('clears the scan types loaded flag', () => {
      expect(state.scanTypesLoaded).toBeFalsy();
    });

    it('clears the fetching comic formats flag', () => {
      expect(state.fetchingFormats).toBeFalsy();
    });

    it('clears the set of formats', () => {
      expect(state.formats).toEqual([]);
    });

    it('clears the formats loaded flag', () => {
      expect(state.formatsLoaded).toBeFalsy();
    });

    it('clears the fetching page types flag', () => {
      expect(state.fetchingPageTypes).toBeFalsy();
    });

    it('clears the set of page types', () => {
      expect(state.pageTypes).toEqual([]);
    });

    it('clears the page types loaded flag', () => {
      expect(state.pageTypesLoaded).toBeFalsy();
    });

    it('clears the fetching comic flag', () => {
      expect(state.fetchingComic).toBeFalsy();
    });

    it('clears the no comic flag', () => {
      expect(state.noComic).toBeFalsy();
    });

    it('has no comic loaded', () => {
      expect(state.comic).toBeNull();
    });

    it('clears the saving page flag', () => {
      expect(state.savingPage).toBeFalsy();
    });

    it('clears the setting page type flag', () => {
      expect(state.settingPageType).toBeFalsy();
    });

    it('clears the deleting page flag', () => {
      expect(state.deletingPage).toBeFalsy();
    });

    it('clears the blocking hash state flag', () => {
      expect(state.blockingPageHash).toBeFalsy();
    });

    it('clears the saving comic flag', () => {
      expect(state.savingComic).toBeFalsy();
    });

    it('clears the clearing metadata flag', () => {
      expect(state.clearingMetadata).toBeFalsy();
    });

    it('clears the deleting comic flag', () => {
      expect(state.deletingComic).toBeFalsy();
    });

    it('clears the restoring flag', () => {
      expect(state.restoringComic).toBeFalsy();
    });

    it('clears the scraping comic flag', () => {
      expect(state.scrapingComic).toBeFalsy();
    });

    it('clears the setting read state flag', () => {
      expect(state.settingReadState).toBeFalsy();
    });
  });

  describe('when fetching the scan types', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetchingScanTypes: false },
        new ComicGetScanTypes()
      );
    });

    it('sets the fetching scan types flag', () => {
      expect(state.fetchingScanTypes).toBeTruthy();
    });
  });

  describe('when the scan types are received', () => {
    const SCAN_TYPES = [SCAN_TYPE_1, SCAN_TYPE_3, SCAN_TYPE_5];

    beforeEach(() => {
      state = reducer(
        {
          ...state,
          fetchingScanTypes: true,
          scanTypesLoaded: false,
          scanTypes: []
        },
        new ComicGotScanTypes({ scanTypes: SCAN_TYPES })
      );
    });

    it('clears the fetching scan types flag', () => {
      expect(state.fetchingScanTypes).toBeFalsy();
    });

    it('sets the scan types loaded flag', () => {
      expect(state.scanTypesLoaded).toBeTruthy();
    });

    it('sets the scan types', () => {
      expect(state.scanTypes).toEqual(SCAN_TYPES);
    });
  });

  describe('when loading the scan types fails', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetchingScanTypes: true, scanTypesLoaded: true },
        new ComicGetScanTypesFailed()
      );
    });

    it('clears the fetching scan types flag', () => {
      expect(state.fetchingScanTypes).toBeFalsy();
    });

    it('clears the scan types loaded flag', () => {
      expect(state.scanTypesLoaded).toBeFalsy();
    });
  });

  describe('when fetching the format types', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetchingFormats: false },
        new ComicGetFormats()
      );
    });

    it('sets the fetching formats flag', () => {
      expect(state.fetchingFormats).toBeTruthy();
    });
  });

  describe('when the format types are retrieved', () => {
    const FORMATS = [FORMAT_1, FORMAT_3, FORMAT_5];

    beforeEach(() => {
      state = reducer(
        { ...state, fetchingFormats: true, formatsLoaded: false, formats: [] },
        new ComicGotFormats({ formats: FORMATS })
      );
    });

    it('clears the fetching formats flag', () => {
      expect(state.fetchingFormats).toBeFalsy();
    });

    it('sets the formats loaded flag', () => {
      expect(state.formatsLoaded).toBeTruthy();
    });

    it('sets the formats', () => {
      expect(state.formats).toEqual(FORMATS);
    });
  });

  describe('when fetching the formats fails', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetchingFormats: true, formatsLoaded: true },
        new ComicGetFormatsFailed()
      );
    });

    it('clears the fetching formats flag', () => {
      expect(state.fetchingFormats).toBeFalsy();
    });

    it('clears the formats loaded flag', () => {
      expect(state.formatsLoaded).toBeFalsy();
    });
  });

  describe('when fetching the set of page types', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetchingPageTypes: false },
        new ComicGetPageTypes()
      );
    });

    it('sets the fetching page types flag', () => {
      expect(state.fetchingPageTypes).toBeTruthy();
    });
  });

  describe('when the page types are loaded', () => {
    const PAGE_TYPES = [FRONT_COVER, STORY, BACK_COVER];

    beforeEach(() => {
      state = reducer(
        {
          ...state,
          fetchingPageTypes: true,
          pageTypesLoaded: false,
          pageTypes: []
        },
        new ComicGotPageTypes({ pageTypes: PAGE_TYPES })
      );
    });

    it('clears the fetching page types flag', () => {
      expect(state.fetchingPageTypes).toBeFalsy();
    });

    it('sets the page types loaded flag', () => {
      expect(state.pageTypesLoaded).toBeTruthy();
    });

    it('sets the page types', () => {
      expect(state.pageTypes).toEqual(PAGE_TYPES);
    });
  });

  describe('when loading the page types fails', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetchingPageTypes: true, pageTypesLoaded: true },
        new ComicGetPageTypesFailed()
      );
    });

    it('clears the fetching page types flag', () => {
      expect(state.fetchingPageTypes).toBeFalsy();
    });

    it('clears the page types loaded flag', () => {
      expect(state.pageTypesLoaded).toBeFalsy();
    });
  });

  describe('when loading a comic', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetchingComic: false, noComic: true },
        new ComicGetIssue({ id: 17 })
      );
    });

    it('clears the no comic flag', () => {
      expect(state.noComic).toBeFalsy();
    });

    it('sets the fetching comic flag', () => {
      expect(state.fetchingComic).toBeTruthy();
    });
  });

  describe('when a comic is retrieved', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetchingComic: true, comic: null },
        new ComicGotIssue({ comic: COMIC })
      );
    });

    it('clears the fetching comic flag', () => {
      expect(state.fetchingComic).toBeFalsy();
    });

    it('sets the comic', () => {
      expect(state.comic).toEqual(COMIC);
    });
  });

  describe('when getting a comic fails', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetchingComic: true, noComic: false },
        new ComicGetIssueFailed()
      );
    });

    it('sets the no comic flag', () => {
      expect(state.noComic).toBeTruthy();
    });

    it('clears the fetching comic flag', () => {
      expect(state.fetchingComic).toBeFalsy();
    });
  });

  describe('when saving a page', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, savingPage: false },
        new ComicSavePage({ page: PAGE_1 })
      );
    });

    it('sets the saving page flag', () => {
      expect(state.savingPage).toBeTruthy();
    });
  });

  describe('when a page is saved', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, savingPage: false, comic: null },
        new ComicPageSaved({ comic: COMIC })
      );
    });

    it('clears the saving page flag', () => {
      expect(state.savingPage).toBeFalsy();
    });

    it('updates the current comic', () => {
      expect(state.comic).toEqual(COMIC);
    });
  });

  describe('when saving a page fails', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, savingPage: true },
        new ComicSavePageFailed()
      );
    });

    it('clears the saving page flag', () => {
      expect(state.savingPage).toBeFalsy();
    });
  });

  describe('setting the page type', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, settingPageType: false },
        new ComicSetPageType({
          page: PAGE,
          pageType: PAGE_TYPE
        })
      );
    });

    it('sets the setting page type flag', () => {
      expect(state.settingPageType).toBeTruthy();
    });
  });

  describe('when the page type is set', () => {
    const UPDATED_PAGE = {
      ...PAGE,
      filename: PAGE.filename.substring(1)
    } as Page;
    beforeEach(() => {
      state = reducer(
        { ...state, settingPageType: true, comic: { ...COMIC } },
        new ComicPageTypeSet({ page: UPDATED_PAGE })
      );
    });

    it('clears the setting page type flag', () => {
      expect(state.settingPageType).toBeFalsy();
    });

    it('updates the page in the comic', () => {
      expect(state.comic.pages).not.toContain(PAGE);
      expect(state.comic.pages).toContain(UPDATED_PAGE);
    });
  });

  describe('when setting the page type fails', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, settingPageType: true },
        new ComicSetPageTypeFailed()
      );
    });

    it('clears the setting page type flag', () => {
      expect(state.settingPageType).toBeFalsy();
    });
  });

  describe('deleting a page', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, deletingPage: false },
        new ComicSetPageDeleted({ page: COMIC.pages[0], deleted: true })
      );
    });

    it('sets the deleting page flag', () => {
      expect(state.deletingPage).toBeTruthy();
    });
  });

  describe('when a page is deleted', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, deletingPage: true, comic: null },
        new ComicPageDeletedSet({ comic: COMIC })
      );
    });

    it('clears the deleting page flag', () => {
      expect(state.deletingPage).toBeFalsy();
    });

    it('updates the comic', () => {
      expect(state.comic).toEqual(COMIC);
    });
  });

  describe('failure to delete a page', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, deletingPage: true },
        new ComicSetPageDeletedFailed()
      );
    });

    it('clears the deleting page flag', () => {
      expect(state.deletingPage).toBeFalsy();
    });
  });

  describe('when setting the blocked state on a page hash', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, blockingPageHash: false },
        new ComicSetPageHashBlocking({ page: PAGE_1, state: true })
      );
    });

    it('sets the blocking hash state flag', () => {
      expect(state.blockingPageHash).toBeTruthy();
    });
  });

  describe('when the blocked state of a hash is set', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, blockingPageHash: true, comic: null },
        new ComicPageHashBlockingSet({ comic: COMIC })
      );
    });

    it('clears the blocking hash state flag', () => {
      expect(state.blockingPageHash).toBeFalsy();
    });

    it('updates the comic', () => {
      expect(state.comic).toEqual(COMIC);
    });
  });

  describe('when setting the blocked state fails', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, blockingPageHash: true },
        new ComicSetPageHashBlockingFailed()
      );
    });

    it('clears the blocking hash state flag', () => {
      expect(state.blockingPageHash).toBeFalsy();
    });
  });

  describe('when saving a comic', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, savingComic: false },
        new ComicSave({ comic: COMIC })
      );
    });

    it('sets the saving comic flag', () => {
      expect(state.savingComic).toBeTruthy();
    });
  });

  describe('when a comic has been saved', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, savingComic: true, comic: null },
        new ComicSaved({ comic: COMIC })
      );
    });

    it('clears the saving comic flag', () => {
      expect(state.savingComic).toBeFalsy();
    });

    it('updates the comic', () => {
      expect(state.comic).toEqual(COMIC);
    });
  });

  describe('when saving a comic fails', () => {
    beforeEach(() => {
      state = reducer({ ...state, savingComic: true }, new ComicSaveFailed());
    });

    it('clears the saving comic flag', () => {
      expect(state.savingComic).toBeFalsy();
    });
  });

  describe('when clearing the metadata for a comic', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, clearingMetadata: false },
        new ComicClearMetadata({ comic: COMIC })
      );
    });

    it('sets the clearing metadata flag', () => {
      expect(state.clearingMetadata).toBeTruthy();
    });
  });

  describe('when the metadata is cleared for a comic', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, clearingMetadata: true, comic: null },
        new ComicMetadataCleared({ comic: COMIC })
      );
    });

    it('clears the clearing metadata flag', () => {
      expect(state.clearingMetadata).toBeFalsy();
    });

    it('updates the computer', () => {
      expect(state.comic).toEqual(COMIC);
    });
  });

  describe('when clearing the metadata fails', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, clearingMetadata: true },
        new ComicClearMetadataFailed()
      );
    });

    it('clears the clearing metadata flag', () => {
      expect(state.clearingMetadata).toBeFalsy();
    });
  });

  describe('when deleting a comic', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, deletingComic: false },
        new ComicDelete({ comic: COMIC })
      );
    });

    it('sets the deleting comic flag', () => {
      expect(state.deletingComic).toBeTruthy();
    });
  });

  describe('when a comic has been deleted', () => {
    const DELETED_COMIC = { ...COMIC, deletedDate: new Date().getTime() };

    beforeEach(() => {
      state = reducer(
        { ...state, comic: COMIC, deletingComic: true },
        new ComicDeleted({ comic: DELETED_COMIC })
      );
    });

    it('clears the deleting comic flag', () => {
      expect(state.deletingComic).toBeFalsy();
    });

    it('updates the comic', () => {
      expect(state.comic).toEqual(DELETED_COMIC);
    });
  });

  describe('when deleting a comic fails', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, deletingComic: true },
        new ComicDeleteFailed()
      );
    });

    it('clears the deleting comic flag', () => {
      expect(state.deletingComic).toBeFalsy();
    });
  });

  describe('when restoring a comic', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, restoringComic: false },
        new ComicRestore({ comic: COMIC })
      );
    });

    it('sets the restoring flag', () => {
      expect(state.restoringComic).toBeTruthy();
    });
  });

  describe('when a comic is restored', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, restoringComic: true, comic: null },
        new ComicRestored({ comic: COMIC })
      );
    });

    it('clears the restoring flag', () => {
      expect(state.restoringComic).toBeFalsy();
    });

    it('updates the comic', () => {
      expect(state.comic).toEqual(COMIC);
    });
  });

  describe('when restoring a comic fails', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, restoringComic: true },
        new ComicRestoreFailed()
      );
    });

    it('clears the restoring flag', () => {
      expect(state.restoringComic).toBeFalsy();
    });
  });

  describe('setting the read state', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, settingReadState: false },
        new ComicMarkAsRead({ comic: COMIC, read: true })
      );
    });

    it('sets the marking as read flag', () => {
      expect(state.settingReadState).toBeTruthy();
    });
  });

  describe('when the comic is marked as read', () => {
    beforeEach(() => {
      state = reducer(
        {
          ...state,
          settingReadState: true,
          comic: { ...COMIC, lastRead: null }
        },
        new ComicMarkedAsRead({ lastRead: LAST_READ_DATE.lastRead })
      );
    });

    it('clears the marking as read flag', () => {
      expect(state.settingReadState).toBeFalsy();
    });

    it('sets the last read date', () => {
      expect(state.comic.lastRead).toEqual(LAST_READ_DATE.lastRead);
    });
  });

  describe('when the last read date is cleared', () => {
    beforeEach(() => {
      state = reducer(
        {
          ...state,
          settingReadState: true,
          comic: { ...COMIC, lastRead: LAST_READ_DATE.lastRead }
        },
        new ComicMarkedAsRead({ lastRead: null })
      );
    });

    it('clears the marking as read flag', () => {
      expect(state.settingReadState).toBeFalsy();
    });

    it('clears the last read date', () => {
      expect(state.comic.lastRead).toBeNull();
    });
  });

  describe('failure to set the read state', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, settingReadState: true },
        new ComicMarkAsReadFailed()
      );
    });

    it('clears the marking as read flag', () => {
      expect(state.settingReadState).toBeFalsy();
    });
  });
});
