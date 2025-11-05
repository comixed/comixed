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
import { DISPLAYABLE_COMIC_4 } from '@app/comic-books/comic-books.fixtures';
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
  scrapeSingleComicBook,
  setAutoSelectExactMatch,
  setChosenMetadataSource,
  setConfirmBeforeScraping
} from '@app/comic-metadata/actions/single-book-scraping.actions';
import {
  Confirmation,
  ConfirmationService
} from '@tragically-slick/confirmation';
import {
  METADATA_SOURCE_1,
  METADATA_SOURCE_2
} from '@app/comic-metadata/comic-metadata.fixtures';
import {
  initialState as initialMetadataSourceListState,
  METADATA_SOURCE_LIST_FEATURE_KEY
} from '@app/comic-metadata/reducers/metadata-source-list.reducer';
import { MetadataSource } from '@app/comic-metadata/models/metadata-source';
import {
  initialState as initialMetadataState,
  SINGLE_BOOK_SCRAPING_FEATURE_KEY
} from '@app/comic-metadata/reducers/single-book-scraping.reducer';
import { DisplayableComic } from '@app/comic-books/models/displayable-comic';

describe('ComicScrapingComponent', () => {
  const COMIC = DISPLAYABLE_COMIC_4;
  const SKIP_CACHE = Math.random() > 0.5;
  const MATCH_PUBLISHER = Math.random() > 0.5;
  const MAXIMUM_RECORDS = 100;
  const PREFERRED_METADATA_SOURCE = { ...METADATA_SOURCE_1, preferred: true };
  const OTHER_METADATA_SOURCE = { ...METADATA_SOURCE_2, preferred: false };
  const METADATA_SOURCES = [PREFERRED_METADATA_SOURCE, OTHER_METADATA_SOURCE];
  const REFERENCE_ID = `${new Date().getTime()}`;

  const initialState = {
    [SCRAPE_METADATA_FEATURE_KEY]: initialScrapeMetadataState,
    [METADATA_SOURCE_LIST_FEATURE_KEY]: initialMetadataSourceListState,
    [SINGLE_BOOK_SCRAPING_FEATURE_KEY]: initialMetadataState
  };

  let component: ComicScrapingComponent;
  let fixture: ComponentFixture<ComicScrapingComponent>;
  let store: MockStore<any>;
  let storeDispatchSpy: jasmine.Spy<any>;
  let confirmationService: ConfirmationService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
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
        MatTooltipModule,
        ComicScrapingComponent
      ],
      providers: [provideMockStore({ initialState }), ConfirmationService]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicScrapingComponent);
    component = fixture.componentInstance;
    component.maximumRecords = MAXIMUM_RECORDS;
    component.skipCache = SKIP_CACHE;
    component.matchPublisher = MATCH_PUBLISHER;
    component.comic = COMIC;
    store = TestBed.inject(MockStore);
    storeDispatchSpy = spyOn(store, 'dispatch');
    confirmationService = TestBed.inject(ConfirmationService);
    fixture.detectChanges();
  }));

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
          referenceId: REFERENCE_ID
        };
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
      component._preferredMetadataSource = null;
    });

    describe('receiving no sources', () => {
      beforeEach(() => {
        store.setState({
          ...initialState,
          [METADATA_SOURCE_LIST_FEATURE_KEY]: {
            ...initialMetadataSourceListState,
            sources: []
          }
        });
      });

      it('leaves the selected source as null', () => {
        expect(component._preferredMetadataSource).toBeNull();
      });
    });

    describe('receiving a single source', () => {
      beforeEach(() => {
        store.setState({
          ...initialState,
          [METADATA_SOURCE_LIST_FEATURE_KEY]: {
            ...initialMetadataSourceListState,
            sources: [OTHER_METADATA_SOURCE]
          }
        });
      });

      it('sets the selected source to the only one returned', () => {
        expect(component._preferredMetadataSource).toBe(OTHER_METADATA_SOURCE);
      });
    });

    describe('receiving multiple sources', () => {
      beforeEach(() => {
        store.setState({
          ...initialState,
          [METADATA_SOURCE_LIST_FEATURE_KEY]: {
            ...initialMetadataSourceListState,
            sources: METADATA_SOURCES
          }
        });
      });

      it('sets the selected source to the preferred one', () => {
        expect(component._preferredMetadataSource).toBe(
          PREFERRED_METADATA_SOURCE
        );
      });
    });
  });

  describe('undoing changes', () => {
    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
    });

    describe('from the button', () => {
      beforeEach(() => {
        component.onUndoChanges();
      });

      it('confirms with the user', () => {
        expect(confirmationService.confirm).toHaveBeenCalled();
      });
    });

    describe('from a hotkey', () => {
      const event = new KeyboardEvent('hotkey');

      beforeEach(() => {
        spyOn(event, 'preventDefault');
        component.onHotkeyUndoChanges(event);
      });

      it('prevents event propagation', () => {
        expect(event.preventDefault).toHaveBeenCalled();
      });

      it('confirms with the user', () => {
        expect(confirmationService.confirm).toHaveBeenCalled();
      });
    });
  });

  describe('fetching the scraping volumes', () => {
    describe('from the button', () => {
      beforeEach(() => {
        spyOn(component.scrape, 'emit');
        component._preferredMetadataSource = OTHER_METADATA_SOURCE;
        component.onFetchScrapingVolumes();
      });

      it('emits an event', () => {
        expect(component.scrape.emit).toHaveBeenCalledWith({
          metadataSource: OTHER_METADATA_SOURCE,
          publisher: COMIC.publisher,
          series: COMIC.series,
          volume: COMIC.volume,
          issueNumber: COMIC.issueNumber,
          maximumRecords: MAXIMUM_RECORDS,
          skipCache: SKIP_CACHE,
          matchPublisher: MATCH_PUBLISHER
        });
      });
    });

    describe('from the hot key', () => {
      const event = new KeyboardEvent('hotkey');

      beforeEach(() => {
        spyOn(component.scrape, 'emit');
        spyOn(event, 'preventDefault');
        component._preferredMetadataSource = OTHER_METADATA_SOURCE;
        component.onHotKeyFetchScrapingVolumes(event);
      });

      it('prevents event propagation', () => {
        expect(event.preventDefault).toHaveBeenCalled();
      });

      it('emits an event', () => {
        expect(component.scrape.emit).toHaveBeenCalledWith({
          metadataSource: OTHER_METADATA_SOURCE,
          publisher: COMIC.publisher,
          series: COMIC.series,
          volume: COMIC.volume,
          issueNumber: COMIC.issueNumber,
          maximumRecords: MAXIMUM_RECORDS,
          skipCache: SKIP_CACHE,
          matchPublisher: MATCH_PUBLISHER
        });
      });
    });
  });

  describe('toggling skipping the cache', () => {
    describe('from the button', () => {
      beforeEach(() => {
        component.onSkipCacheToggle();
      });

      it('flips the skip cache flag', () => {
        expect(component.skipCache).toEqual(!SKIP_CACHE);
      });
    });

    describe('from the button', () => {
      const event = new KeyboardEvent('hotkey');

      beforeEach(() => {
        spyOn(event, 'preventDefault');
        component.onHotKeySkipCacheToggle(event);
      });

      it('prevents event propagation', () => {
        expect(event.preventDefault).toHaveBeenCalled();
      });

      it('flips the skip cache flag', () => {
        expect(component.skipCache).toEqual(!SKIP_CACHE);
      });
    });
  });

  describe('toggling matching the publisher', () => {
    describe('from the button', () => {
      beforeEach(() => {
        component.onMatchPublisherToggle();
      });

      it('flips the match publisher flag', () => {
        expect(component.matchPublisher).toEqual(!MATCH_PUBLISHER);
      });
    });

    describe('from the button', () => {
      const event = new KeyboardEvent('hotkey');

      beforeEach(() => {
        spyOn(event, 'preventDefault');
        component.onHotKeyMatchPublisherToggle(event);
      });

      it('prevents event propagation', () => {
        expect(event.preventDefault).toHaveBeenCalled();
      });

      it('flips the match publisher flag', () => {
        expect(component.matchPublisher).toEqual(!MATCH_PUBLISHER);
      });
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
    });

    describe('from the button', () => {
      beforeEach(() => {
        component.onSaveChanges();
      });

      it('confirms with the user', () => {
        expect(confirmationService.confirm).toHaveBeenCalled();
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          updateComicBook({
            comicBookId: COMIC.comicBookId,
            publisher: COMIC.publisher,
            series: COMIC.series,
            volume: COMIC.volume,
            issueNumber: COMIC.issueNumber
          })
        );
      });
    });

    describe('from a hotkey', () => {
      const event = new KeyboardEvent('hotkey');

      beforeEach(() => {
        spyOn(event, 'preventDefault');
        component.onHotKeySaveChanges(event);
      });

      it('prevents event propagation', () => {
        expect(event.preventDefault).toHaveBeenCalled();
      });

      it('confirms with the user', () => {
        expect(confirmationService.confirm).toHaveBeenCalled();
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          updateComicBook({
            comicBookId: COMIC.comicBookId,
            publisher: COMIC.publisher,
            series: COMIC.series,
            volume: COMIC.volume,
            issueNumber: COMIC.issueNumber
          })
        );
      });
    });
  });

  describe('when a filename was scraped for metadata', () => {
    beforeEach(() => {
      store.setState({
        ...initialState,
        [SCRAPE_METADATA_FEATURE_KEY]: {
          ...initialScrapeMetadataState,
          found: true,
          series: COMIC.series,
          volume: COMIC.volume,
          issueNumber: COMIC.issueNumber
        }
      });
    });

    it('sets the series', () => {
      expect(component.comicForm.controls.series.value).toEqual(COMIC.series);
    });

    it('sets the volume', () => {
      expect(component.comicForm.controls.volume.value).toEqual(COMIC.volume);
    });

    it('sets the issue number', () => {
      expect(component.comicForm.controls.issueNumber.value).toEqual(
        COMIC.issueNumber
      );
    });
  });

  describe('scraping metadata from a filename', () => {
    beforeEach(() => {
      component.comic = COMIC;
    });

    describe('using the button', () => {
      beforeEach(() => {
        component.onScrapeFilename();
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          scrapeMetadataFromFilename({ filename: COMIC.baseFilename })
        );
      });
    });

    describe('using a hotkey', () => {
      const event = new KeyboardEvent('hotkey');

      beforeEach(() => {
        spyOn(event, 'preventDefault');
        component.onHotKeyScrapeFilename(event);
      });

      it('prevents event propagation', () => {
        expect(event.preventDefault).toHaveBeenCalled();
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          scrapeMetadataFromFilename({ filename: COMIC.baseFilename })
        );
      });
    });
  });

  describe('selecting a metadata source', () => {
    beforeEach(() => {
      component.metadataSourceList = [
        { label: 'first', value: OTHER_METADATA_SOURCE },
        {
          label: 'second',
          value: {
            metadataSourceId: OTHER_METADATA_SOURCE.metadataSourceId + 100
          } as MetadataSource
        }
      ];
      component.onMetadataSourceChosen(OTHER_METADATA_SOURCE.metadataSourceId);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        setChosenMetadataSource({ metadataSource: OTHER_METADATA_SOURCE })
      );
    });
  });

  describe('checking if ready to scrape', () => {
    beforeEach(() => {
      component._preferredMetadataSource = null;
      component._previousMetadataSource = null;
      component._selectedMetadataSource = null;
      component.comic = COMIC;
    });

    it('requires a metadata source', () => {
      expect(component.readyToScrape).toBeFalse();
    });

    it('will use the preferred metadata source', () => {
      component._preferredMetadataSource = OTHER_METADATA_SOURCE;
      expect(component.readyToScrape).toBeTrue();
    });

    it('will use the previous metadata source', () => {
      component._previousMetadataSource = OTHER_METADATA_SOURCE;
      expect(component.readyToScrape).toBeTrue();
    });

    it('will use the selected metadata source', () => {
      component._selectedMetadataSource = OTHER_METADATA_SOURCE;
      expect(component.readyToScrape).toBeTrue();
    });

    it('requires a valid form', () => {
      component.comic = {} as DisplayableComic;
      expect(component.readyToScrape).toBeFalse();
    });
  });

  describe('scraping a comic using the reference id', () => {
    const SCRAPING_COMIC = {
      ...COMIC,
      referenceId: REFERENCE_ID
    };

    beforeEach(() => {
      component.comic = SCRAPING_COMIC;
      component._previousMetadataSource = OTHER_METADATA_SOURCE;
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
        scrapeSingleComicBook({
          metadataSource: OTHER_METADATA_SOURCE,
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
    });

    describe('from the button', () => {
      beforeEach(() => {
        component.onToggleConfirmBeforeScrape();
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          setConfirmBeforeScraping({ confirmBeforeScraping: confirm })
        );
      });
    });

    describe('from the hotkey', () => {
      const event = new KeyboardEvent('hotkey');

      beforeEach(() => {
        spyOn(event, 'preventDefault');
        component.onHotkeyToggleConfirmBeforeScrape(event);
      });

      it('prevents event propagation', () => {
        expect(event.preventDefault).toHaveBeenCalled();
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          setConfirmBeforeScraping({ confirmBeforeScraping: confirm })
        );
      });
    });
  });

  describe('toggling autoselecting exact matches', () => {
    const confirm = Math.random() > 0.5;

    beforeEach(() => {
      component.autoSelectExactMatch = !confirm;
    });

    describe('from the button', () => {
      beforeEach(() => {
        component.onToggleAutoSelectExactMatch();
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          setAutoSelectExactMatch({ autoSelectExactMatch: confirm })
        );
      });
    });

    describe('from the button', () => {
      const event = new KeyboardEvent('hotkey');

      beforeEach(() => {
        spyOn(event, 'preventDefault');
        component.onHotKeyToggleAutoSelectExactMatch(event);
      });

      it('prevents event propagation', () => {
        expect(event.preventDefault).toHaveBeenCalled();
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          setAutoSelectExactMatch({ autoSelectExactMatch: confirm })
        );
      });
    });
  });

  describe('setting the previous metadata source', () => {
    beforeEach(() => {
      component.previousMetadataSource = OTHER_METADATA_SOURCE;
    });

    it('stores the reference', () => {
      expect(component._previousMetadataSource).toBe(OTHER_METADATA_SOURCE);
    });
  });

  describe('getting the metadata source', () => {
    const PREFERRED_METADATA_SOURCE = { ...OTHER_METADATA_SOURCE, id: 100 };
    const PREVIOUS_METADATA_SOURCE = { ...OTHER_METADATA_SOURCE, id: 200 };
    const SELECTED_METADATA_SOURCE = { ...OTHER_METADATA_SOURCE, id: 300 };

    beforeEach(() => {
      component._preferredMetadataSource = null;
      component._previousMetadataSource = null;
      component._selectedMetadataSource = null;
    });

    it('returns the preferred source', () => {
      component._preferredMetadataSource = PREFERRED_METADATA_SOURCE;
      expect(component.metadataSource).toBe(PREFERRED_METADATA_SOURCE);
    });

    it('returns the previous source', () => {
      component._previousMetadataSource = PREVIOUS_METADATA_SOURCE;
      expect(component.metadataSource).toBe(PREVIOUS_METADATA_SOURCE);
    });

    it('returns the selected source', () => {
      component._selectedMetadataSource = SELECTED_METADATA_SOURCE;
      expect(component.metadataSource).toBe(SELECTED_METADATA_SOURCE);
    });

    it('prefers the selected source', () => {
      component._preferredMetadataSource = PREFERRED_METADATA_SOURCE;
      component._selectedMetadataSource = SELECTED_METADATA_SOURCE;
      component._selectedMetadataSource = SELECTED_METADATA_SOURCE;
      expect(component.metadataSource).toBe(SELECTED_METADATA_SOURCE);
    });
  });

  describe('setting the preferred metadata source', () => {
    beforeEach(() => {
      component._preferredMetadataSource = null;
      component.metadataSource = OTHER_METADATA_SOURCE;
    });

    it('stores the preferred source', () => {
      expect(component.metadataSource).toBe(OTHER_METADATA_SOURCE);
    });
  });
});
