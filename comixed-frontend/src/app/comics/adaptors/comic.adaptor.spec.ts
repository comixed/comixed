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

import { ComicAdaptor } from './comic.adaptor';
import { TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import * as fromComics from 'app/comics/reducers/comic.reducer';
import { EffectsModule } from '@ngrx/effects';
import { ComicEffects } from 'app/comics/effects/comic.effects';
import { AppState } from 'app/comics';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MessageService } from 'primeng/api';
import { TranslateModule } from '@ngx-translate/core';
import {
  ComicClearMetadata,
  ComicDelete,
  ComicGetFormats,
  ComicGetIssue,
  ComicGetPageTypes,
  ComicGetScanTypes,
  ComicGotFormats,
  ComicGotIssue,
  ComicGotPageTypes,
  ComicGotScanTypes,
  ComicSave,
  ComicSavePage,
  ComicScrape,
  ComicSetPageHashBlocking
} from 'app/comics/actions/comic.actions';
import { COMIC_1 } from 'app/comics/models/comic.fixtures';
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
import { FRONT_COVER } from 'app/comics/models/page-type.fixtures';
import { PAGE_1 } from 'app/comics/models/page.fixtures';

describe('ComicAdaptor', () => {
  const SCAN_TYPES = [SCAN_TYPE_1, SCAN_TYPE_3, SCAN_TYPE_5];
  const FORMATS = [FORMAT_1, FORMAT_3, FORMAT_5];
  const COMIC = COMIC_1;
  const API_KEY = 'ABCDEF0123456789';
  const ISSUE_ID = 44147;
  const SKIP_CACHE = false;

  let adaptor: ComicAdaptor;
  let store: Store<AppState>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot(),
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
  });

  it('should create an instance', () => {
    expect(adaptor).toBeTruthy();
  });

  describe('loading scan types', () => {
    it('can load the scan types', () => {
      spyOn(store, 'dispatch');
      adaptor.getScanTypes();
      expect(store.dispatch).toHaveBeenCalledWith(new ComicGetScanTypes());
    });

    it('only retrieves the scan types once', () => {
      store.dispatch(new ComicGotScanTypes({ scanTypes: SCAN_TYPES }));
      spyOn(store, 'dispatch');
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
      spyOn(store, 'dispatch');
      adaptor.getFormats();
      expect(store.dispatch).toHaveBeenCalledWith(new ComicGetFormats());
    });

    it('only retrieves the scan types once', () => {
      store.dispatch(new ComicGotFormats({ formats: FORMATS }));
      spyOn(store, 'dispatch');
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

  it('provides notice when fetching a comic', () => {
    store.dispatch(new ComicGetIssue({ id: 17 }));
    adaptor.fetchingIssue$.subscribe(result => expect(result).toBeTruthy());
  });

  it('provides notice when the comic changes', () => {
    store.dispatch(new ComicGotIssue({ comic: COMIC }));
    adaptor.comic$.subscribe(result => expect(result).toEqual(COMIC));
  });

  it('can get a comic by id', () => {
    spyOn(store, 'dispatch');
    adaptor.getComicById(17);
    expect(store.dispatch).toHaveBeenCalledWith(new ComicGetIssue({ id: 17 }));
  });

  it('can save changes to a page', () => {
    spyOn(store, 'dispatch');
    adaptor.savePage(PAGE_1);
    expect(store.dispatch).toHaveBeenCalledWith(
      new ComicSavePage({ page: PAGE_1 })
    );
  });

  it('can block a page hash', () => {
    spyOn(store, 'dispatch');
    adaptor.blockPageHash(PAGE_1);
    expect(store.dispatch).toHaveBeenCalledWith(
      new ComicSetPageHashBlocking({ page: PAGE_1, state: true })
    );
  });

  it('can unblock a page hash', () => {
    spyOn(store, 'dispatch');
    adaptor.unblockPageHash(PAGE_1);
    expect(store.dispatch).toHaveBeenCalledWith(
      new ComicSetPageHashBlocking({ page: PAGE_1, state: false })
    );
  });

  it('can save a comic', () => {
    spyOn(store, 'dispatch');
    adaptor.saveComic(COMIC);
    expect(store.dispatch).toHaveBeenCalledWith(
      new ComicSave({ comic: COMIC })
    );
  });

  it('can clear the metadata from a comic', () => {
    spyOn(store, 'dispatch');
    adaptor.clearMetadata(COMIC);
    expect(store.dispatch).toHaveBeenCalledWith(
      new ComicClearMetadata({ comic: COMIC })
    );
  });

  it('can delete a comic from the library', () => {
    spyOn(store, 'dispatch');
    adaptor.deleteComic(COMIC);
    expect(store.dispatch).toHaveBeenCalledWith(
      new ComicDelete({ comic: COMIC })
    );
  });

  it('fires an action when scraping a comic', () => {
    spyOn(store, 'dispatch');
    adaptor.scrapeComic(COMIC, API_KEY, ISSUE_ID, SKIP_CACHE);
    expect(store.dispatch).toHaveBeenCalledWith(
      new ComicScrape({
        comic: COMIC,
        apiKey: API_KEY,
        issueId: ISSUE_ID,
        skipCache: SKIP_CACHE
      })
    );
  });
});
