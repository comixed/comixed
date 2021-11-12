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
import { ComicEditComponent } from './comic-edit.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  COMIC_2,
  IMPRINT_1,
  IMPRINT_2,
  IMPRINT_3
} from '@app/comic-books/comic-books.fixtures';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { ConfirmationService } from '@app/core/services/confirmation.service';
import { Confirmation } from '@app/core/models/confirmation';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { saveUserPreference } from '@app/user/actions/user.actions';
import { MAXIMUM_RECORDS_PREFERENCE } from '@app/library/library.constants';
import { updateComic } from '@app/comic-books/actions/comic.actions';
import {
  IMPRINT_LIST_FEATURE_KEY,
  initialState as initialImprintState
} from '@app/comic-books/reducers/imprint-list.reducer';
import {
  initialState as initialScrapeMetadataState,
  SCRAPE_METADATA_FEATURE_KEY
} from '@app/comic-files/reducers/scrape-metadata.reducer';
import { scrapeMetadataFromFilename } from '@app/comic-files/actions/scrape-metadata.actions';
import { scrapeComic } from '@app/comic-books/actions/scraping.actions';

describe('ComicEditComponent', () => {
  const ENTRIES = [IMPRINT_1, IMPRINT_2, IMPRINT_3];
  const COMIC = COMIC_2;
  const SKIP_CACHE = Math.random() > 0.5;
  const MAXIMUM_RECORDS = 100;
  const ISSUE_NUMBER = '27';

  const initialState = {
    [IMPRINT_LIST_FEATURE_KEY]: { ...initialImprintState, entries: ENTRIES },
    [SCRAPE_METADATA_FEATURE_KEY]: initialScrapeMetadataState
  };

  let component: ComicEditComponent;
  let fixture: ComponentFixture<ComicEditComponent>;
  let store: MockStore<any>;
  let confirmationService: ConfirmationService;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ComicEditComponent],
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

      fixture = TestBed.createComponent(ComicEditComponent);
      component = fixture.componentInstance;
      component.maximumRecords = MAXIMUM_RECORDS;
      component.skipCache = SKIP_CACHE;
      component.comic = COMIC;
      store = TestBed.inject(MockStore);
      spyOn(store, 'dispatch');
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
        series: COMIC.series,
        volume: COMIC.volume,
        issueNumber: COMIC.issueNumber,
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
          name: MAXIMUM_RECORDS_PREFERENCE,
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
      component.onSaveChanges();
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        updateComic({ comic: COMIC })
      );
    });
  });

  describe('when an imprint is selected', () => {
    const IMPRINT = ENTRIES[0];

    beforeEach(() => {
      component.comic = COMIC;
      component.onImprintSelected(IMPRINT.name);
    });

    it('updates the imprint', () => {
      expect(component.comicForm.controls.imprint.value).toEqual(IMPRINT.name);
    });

    it('updates the publisher', () => {
      expect(component.comicForm.controls.publisher.value).toEqual(
        IMPRINT.publisher
      );
    });

    describe('when it is cleared', () => {
      beforeEach(() => {
        component.onImprintSelected(null);
      });

      it('updates the imprint', () => {
        expect(component.comicForm.controls.imprint.value).toEqual(
          COMIC.imprint
        );
      });

      it('updates the publisher', () => {
        expect(component.comicForm.controls.publisher.value).toEqual(
          COMIC.publisher
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
      component.onScrapeFilename();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        scrapeMetadataFromFilename({ filename: COMIC.baseFilename })
      );
    });
  });

  describe('scraping a comic using the ComicVine id', () => {
    beforeEach(() => {
      component.comic = COMIC;
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.onScrapeUsingComicVineId();
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        scrapeComic({
          issueId: COMIC.comicVineId,
          comic: COMIC,
          skipCache: SKIP_CACHE
        })
      );
    });
  });
});
