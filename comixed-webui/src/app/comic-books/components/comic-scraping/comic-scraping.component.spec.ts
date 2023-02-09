/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ComicScrapingComponent } from './comic-scraping.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { COMIC_BOOK_2 } from '@app/comic-books/comic-books.fixtures';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { saveUserPreference } from '@app/user/actions/user.actions';
import { MAXIMUM_SCRAPING_RECORDS_PREFERENCE } from '@app/library/library.constants';
import { updateComicBook } from '@app/comic-books/actions/comic-book.actions';
import {
  initialState as initialScrapeMetadataState,
  SCRAPE_METADATA_FEATURE_KEY
} from '@app/comic-files/reducers/scrape-metadata.reducer';
import { scrapeMetadataFromFilename } from '@app/comic-files/actions/scrape-metadata.actions';
import {
  scrapeComic,
  setAutoSelectExactMatch,
  setChosenMetadataSource,
  setConfirmBeforeScraping
} from '@app/comic-metadata/actions/metadata.actions';
import {
  Confirmation,
  ConfirmationService
} from '@tragically-slick/confirmation';
import { METADATA_SOURCE_1 } from '@app/comic-metadata/comic-metadata.fixtures';
import {
  initialState as initialMetadataSourceListState,
  METADATA_SOURCE_LIST_FEATURE_KEY
} from '@app/comic-metadata/reducers/metadata-source-list.reducer';
import { ComicBook } from '@app/comic-books/models/comic-book';
import { MetadataSource } from '@app/comic-metadata/models/metadata-source';
import {
  initialState as initialMetadataState,
  METADATA_FEATURE_KEY
} from '@app/comic-metadata/reducers/metadata.reducer';

describe('ComicScrapingComponent', () => {
  const COMIC = COMIC_BOOK_2;
  const SKIP_CACHE = Math.random() > 0.5;
  const MAXIMUM_RECORDS = 100;
  const METADATA_SOURCE = METADATA_SOURCE_1;
  const METADATA_SOURCES = [METADATA_SOURCE_1];
  const REFERENCE_ID = `${new Date().getTime()}`;

  const initialState = {
    [SCRAPE_METADATA_FEATURE_KEY]: initialScrapeMetadataState,
    [METADATA_SOURCE_LIST_FEATURE_KEY]: initialMetadataSourceListState,
    [METADATA_FEATURE_KEY]: initialMetadataState
  };

  let component: ComicScrapingComponent;
  let fixture: ComponentFixture<ComicScrapingComponent>;
  let store: MockStore<any>;
  let storeDispatchSpy: jasmine.Spy<any>;
  let confirmationService: ConfirmationService;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ComicScrapingComponent],
        imports: [
          NoopAnimationsModule,
          LoggerModule.forRoot(),
          TranslateModule.forRoot(),
          FormsModule,
          ReactiveFormsModule,
          MatDialogModule,
          MatFormFieldModule,
          MatToolbarModule,
          MatIconModule,
          MatInputModule,
          MatSelectModule,
          MatTooltipModule
        ],
        providers: [provideMockStore({ initialState }), ConfirmationService]
      }).compileComponents();

      fixture = TestBed.createComponent(ComicScrapingComponent);
      component = fixture.componentInstance;
      component.maximumRecords = MAXIMUM_RECORDS;
      component.skipCache = SKIP_CACHE;
      component.comic = COMIC;
      store = TestBed.inject(MockStore);
      storeDispatchSpy = spyOn(store, 'dispatch');
      confirmationService = TestBed.inject(ConfirmationService);
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('setting the comic', () => {
    beforeEach(() => {
      component.comic = COMIC;
    });

    it('updates the comic reference', () => {
      expect(component.comic).toEqual(COMIC);
    });

    describe('if the comic has an associated metadata source', () => {
      beforeEach(() => {
        component.comic = {
          ...COMIC,
          metadata: {
            metadataSource: METADATA_SOURCE,
            referenceId: REFERENCE_ID
          }
        };
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          setChosenMetadataSource({ metadataSource: METADATA_SOURCE })
        );
      });

      it('loads the reference id', () => {
        expect(component.comicForm.controls.referenceId.value).toEqual(
          REFERENCE_ID
        );
      });
    });
  });

  describe('loading the metadata sources', () => {
    beforeEach(() => {
      component.metadataSource = null;
      store.setState({
        ...initialState,
        [METADATA_SOURCE_LIST_FEATURE_KEY]: {
          ...initialMetadataSourceListState,
          sources: METADATA_SOURCES
        }
      });
    });

    it('sets the initial source', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        setChosenMetadataSource({ metadataSource: METADATA_SOURCES[0] })
      );
    });
  });

  describe('undoing changes', () => {
    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.onUndoChanges();
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });
  });

  describe('fetching the scraping volumes', () => {
    beforeEach(() => {
      spyOn(component.scrape, 'emit');
      component.onFetchScrapingVolumes();
    });

    it('emits an event', () => {
      expect(component.scrape.emit).toHaveBeenCalledWith({
        series: COMIC.detail.series,
        volume: COMIC.detail.volume,
        issueNumber: COMIC.detail.issueNumber,
        maximumRecords: MAXIMUM_RECORDS,
        skipCache: SKIP_CACHE
      });
    });
  });

  describe('toggling skipping the cache', () => {
    beforeEach(() => {
      component.onSkipCacheToggle();
    });

    it('flips the skip cache flag', () => {
      expect(component.skipCache).toEqual(!SKIP_CACHE);
    });
  });

  describe('setting the maximum records', () => {
    beforeEach(() => {
      component.onMaximumRecordsChanged(MAXIMUM_RECORDS);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        saveUserPreference({
          name: MAXIMUM_SCRAPING_RECORDS_PREFERENCE,
          value: `${MAXIMUM_RECORDS}`
        })
      );
    });
  });

  describe('saving changes', () => {
    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.comic = COMIC;
      storeDispatchSpy.calls.reset();
      component.onSaveChanges();
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        updateComicBook({ comicBook: component.encodeForm() })
      );
    });
  });

  describe('when a filename was scraped for metadata', () => {
    beforeEach(() => {
      store.setState({
        ...initialState,
        [SCRAPE_METADATA_FEATURE_KEY]: {
          ...initialScrapeMetadataState,
          found: true,
          series: COMIC.detail.series,
          volume: COMIC.detail.volume,
          issueNumber: COMIC.detail.issueNumber
        }
      });
    });

    it('sets the series', () => {
      expect(component.comicForm.controls.series.value).toEqual(
        COMIC.detail.series
      );
    });

    it('sets the volume', () => {
      expect(component.comicForm.controls.volume.value).toEqual(
        COMIC.detail.volume
      );
    });

    it('sets the issue number', () => {
      expect(component.comicForm.controls.issueNumber.value).toEqual(
        COMIC.detail.issueNumber
      );
    });
  });

  describe('scraping metadata from a filename', () => {
    beforeEach(() => {
      component.comic = COMIC;
      component.onScrapeFilename();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        scrapeMetadataFromFilename({ filename: COMIC.detail.baseFilename })
      );
    });
  });

  describe('selecting a metadata source', () => {
    beforeEach(() => {
      component.metadataSourceList = [
        { label: 'first', value: METADATA_SOURCE },
        {
          label: 'second',
          value: { id: METADATA_SOURCE.id + 100 } as MetadataSource
        }
      ];
      component.onMetadataSourceChosen(METADATA_SOURCE.id);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        setChosenMetadataSource({ metadataSource: METADATA_SOURCE })
      );
    });
  });

  describe('checking if ready to scrape', () => {
    beforeEach(() => {
      component.metadataSource = METADATA_SOURCE;
      component.comic = COMIC;
    });

    it('requires a metadata source', () => {
      component.metadataSource = null;
      expect(component.readyToScrape).toBeFalse();
    });

    it('requires a valid form', () => {
      component.comic = { detail: {} } as ComicBook;
      expect(component.readyToScrape).toBeFalse();
    });
  });

  describe('scraping a comic using the reference id', () => {
    const SCRAPING_COMIC = {
      ...COMIC,
      metadata: {
        metadataSource: METADATA_SOURCE,
        referenceId: REFERENCE_ID
      }
    };

    beforeEach(() => {
      component.comic = SCRAPING_COMIC;
      component.metadataSource = METADATA_SOURCE;
      storeDispatchSpy.calls.reset();
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.onScrapeWithReferenceId();
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        scrapeComic({
          metadataSource: METADATA_SOURCE,
          issueId: REFERENCE_ID,
          comic: SCRAPING_COMIC,
          skipCache: SKIP_CACHE
        })
      );
    });
  });

  describe('toggling confirmation before scraping', () => {
    const confirm = Math.random() > 0.5;

    beforeEach(() => {
      component.confirmBeforeScraping = !confirm;
      component.onToggleConfirmBeforeScrape();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        setConfirmBeforeScraping({ confirmBeforeScraping: confirm })
      );
    });
  });

  describe('toggling autoselecting exact matches', () => {
    const confirm = Math.random() > 0.5;

    beforeEach(() => {
      component.autoSelectExactMatch = !confirm;
      component.onToggleAutoSelectExactMatch();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        setAutoSelectExactMatch({ autoSelectExactMatch: confirm })
      );
    });
  });
});
