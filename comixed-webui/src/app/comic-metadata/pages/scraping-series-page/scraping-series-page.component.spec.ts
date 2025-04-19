/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScrapingSeriesPageComponent } from './scraping-series-page.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { VolumeMetadataTableComponent } from '@app/comic-books/components/volume-metadata-table/volume-metadata-table.component';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import {
  initialState as initialUserState,
  USER_FEATURE_KEY
} from '@app/user/reducers/user.reducer';
import { USER_ADMIN } from '@app/user/user.fixtures';
import {
  initialState as initialMetadataSourceListState,
  METADATA_SOURCE_LIST_FEATURE_KEY
} from '@app/comic-metadata/reducers/metadata-source-list.reducer';
import {
  initialState as initialMetadataState,
  SINGLE_BOOK_SCRAPING_FEATURE_KEY
} from '@app/comic-metadata/reducers/single-book-scraping.reducer';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  METADATA_SOURCE_1,
  METADATA_SOURCE_2,
  SCRAPING_VOLUME_1
} from '@app/comic-metadata/comic-metadata.fixtures';
import { TitleService } from '@app/core/services/title.service';
import {
  MATCH_PUBLISHER_PREFERENCE,
  MAXIMUM_SCRAPING_RECORDS_PREFERENCE,
  SKIP_CACHE_PREFERENCE
} from '@app/library/library.constants';
import { Preference } from '@app/user/models/preference';
import { loadVolumeMetadata } from '@app/comic-metadata/actions/single-book-scraping.actions';
import {
  Confirmation,
  ConfirmationService
} from '@tragically-slick/confirmation';
import { scrapeSeriesMetadata } from '@app/comic-metadata/actions/scrape-series.actions';
import {
  initialState as initialFetchIssuesForSeriesState,
  SCRAPE_SERIES_FEATURE_KEY
} from '@app/comic-metadata/reducers/scrape-series.reducer';
import { saveUserPreference } from '@app/user/actions/user.actions';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PUBLISHER_1, SERIES_1 } from '@app/collections/collections.fixtures';

describe('ScrapingSeriesPageComponent', () => {
  const ORIGINAL_PUBLISHER = PUBLISHER_1.name;
  const PUBLISHER = SERIES_1.publisher;
  const ORIGINAL_SERIES = SERIES_1.name;
  const EDITED_SERIES = SERIES_1.name.substring(1);
  const ORIGINAL_VOLUME = SERIES_1.volume;
  const SCRAPING_VOLUME = SCRAPING_VOLUME_1;
  const METADATA_SOURCE = METADATA_SOURCE_2;
  const initialState = {
    [USER_FEATURE_KEY]: { ...initialUserState, user: USER_ADMIN },
    [METADATA_SOURCE_LIST_FEATURE_KEY]: {
      ...initialMetadataSourceListState,
      sources: [{ ...METADATA_SOURCE_1, preferred: true }, METADATA_SOURCE_2]
    },
    [SINGLE_BOOK_SCRAPING_FEATURE_KEY]: { ...initialMetadataState },
    [SCRAPE_SERIES_FEATURE_KEY]: {
      ...initialFetchIssuesForSeriesState
    }
  };
  const SKIP_CACHE = Math.random() > 0.5;
  const MATCH_PUBLISHER = Math.random() > 0.5;

  let component: ScrapingSeriesPageComponent;
  let fixture: ComponentFixture<ScrapingSeriesPageComponent>;
  let store: MockStore<any>;
  let storeDispatchSpy: jasmine.Spy;
  let translateService: TranslateService;
  let titleService: TitleService;
  let confirmationService: ConfirmationService;
  let dialog: MatDialog;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScrapingSeriesPageComponent, VolumeMetadataTableComponent],
      imports: [
        NoopAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forRoot([{ path: '*', redirectTo: '' }]),
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
        MatSelectModule,
        MatToolbarModule,
        MatPaginatorModule,
        MatTableModule,
        MatCheckboxModule,
        MatInputModule,
        MatTooltipModule,
        MatButtonModule
      ],
      providers: [
        provideMockStore({ initialState }),
        TitleService,
        ConfirmationService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ScrapingSeriesPageComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    storeDispatchSpy = spyOn(store, 'dispatch');
    translateService = TestBed.inject(TranslateService);
    titleService = TestBed.inject(TitleService);
    confirmationService = TestBed.inject(ConfirmationService);
    dialog = TestBed.inject(MatDialog);
    spyOn(dialog, 'open');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('preselects the preferred source', () => {
    expect(component.metadataSource).not.toBeNull();
  });

  describe('when the language changes', () => {
    beforeEach(() => {
      spyOn(titleService, 'setTitle');
      translateService.use('fr');
    });

    it('resets the tab title', () => {
      expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('skipping the cache', () => {
    const SKIP_CACHE = Math.random() > 0.5;

    beforeEach(() => {
      component.skipCache = !SKIP_CACHE;
      store.setState({
        ...initialState,
        [USER_FEATURE_KEY]: {
          ...initialUserState,
          user: {
            ...USER_ADMIN,
            preferences: [
              {
                name: SKIP_CACHE_PREFERENCE,
                value: `${SKIP_CACHE}`
              } as Preference
            ]
          }
        }
      });
    });

    it('sets the skip cache property', () => {
      expect(component.skipCache).toEqual(SKIP_CACHE);
    });
  });

  describe('matching the publisher', () => {
    const MATCH_PUBLISHER = Math.random() > 0.5;

    beforeEach(() => {
      component.matchPublisher = !MATCH_PUBLISHER;
      store.setState({
        ...initialState,
        [USER_FEATURE_KEY]: {
          ...initialUserState,
          user: {
            ...USER_ADMIN,
            preferences: [
              {
                name: MATCH_PUBLISHER_PREFERENCE,
                value: `${MATCH_PUBLISHER}`
              } as Preference
            ]
          }
        }
      });
    });

    it('sets the match publisher property', () => {
      expect(component.matchPublisher).toEqual(MATCH_PUBLISHER);
    });
  });

  describe('setting the metadata source', () => {
    describe('clearing the source', () => {
      beforeEach(() => {
        component.metadataSource = null;
      });

      it('clears the source', () => {
        expect(component.metadataSource).toBeUndefined();
      });
    });

    describe('setting the source', () => {
      beforeEach(() => {
        component.metadataSource = METADATA_SOURCE_2;
      });

      it('selects the source', () => {
        expect(component.metadataSource).toEqual(METADATA_SOURCE_2);
      });
    });
  });

  describe('selecting a metadata source', () => {
    beforeEach(() => {
      component.onMetadataSourceSelected(METADATA_SOURCE_2.metadataSourceId);
    });

    it('selects the source', () => {
      expect(component.metadataSource).toEqual(METADATA_SOURCE_2);
    });
  });

  describe('fetching issues', () => {
    beforeEach(() => {
      component.metadataSource = METADATA_SOURCE_2;
      component.scrapeSeriesForm.controls['publisher'].setValue(PUBLISHER);
      component.scrapeSeriesForm.controls['series'].setValue(EDITED_SERIES);
      component.onFetchVolumeCandidates();
    });

    it('dispatches an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        loadVolumeMetadata({
          metadataSource: METADATA_SOURCE_2,
          publisher: PUBLISHER,
          series: EDITED_SERIES,
          skipCache: false,
          matchPublisher: false,
          maximumRecords: 0
        })
      );
    });
  });

  describe('selecting a volume', () => {
    beforeEach(() => {
      component.selectedVolume = null;
      component.onVolumeSelected(SCRAPING_VOLUME);
    });

    it('sets the volume', () => {
      expect(component.selectedVolume).toEqual(SCRAPING_VOLUME);
    });
  });

  describe('choosing a volume', () => {
    beforeEach(() => {
      component.originalPublisher = ORIGINAL_PUBLISHER;
      component.originalSeries = ORIGINAL_SERIES;
      component.originalVolume = ORIGINAL_VOLUME;
      component.metadataSource = METADATA_SOURCE;
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.onVolumeChosen(SCRAPING_VOLUME);
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('dispatches an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        scrapeSeriesMetadata({
          originalPublisher: ORIGINAL_PUBLISHER,
          originalSeries: ORIGINAL_SERIES,
          originalVolume: ORIGINAL_VOLUME,
          source: METADATA_SOURCE,
          volume: SCRAPING_VOLUME
        })
      );
    });
  });

  describe('setting the maximum number of records', () => {
    const MAX_RECORDS = 1000;

    beforeEach(() => {
      component.maximumRecords = 0;
      component.onMaximumRecordsChanged(MAX_RECORDS);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        saveUserPreference({
          name: MAXIMUM_SCRAPING_RECORDS_PREFERENCE,
          value: `${MAX_RECORDS}`
        })
      );
    });
  });

  describe('showing the warning dialog', () => {
    beforeEach(() => {
      component.onShowNotice({});
    });

    it('opens a dialog', () => {
      expect(dialog.open).toHaveBeenCalled();
    });
  });

  describe('toggling skipping the cache', () => {
    beforeEach(() => {
      component.skipCache = SKIP_CACHE;
      storeDispatchSpy.calls.reset();
    });

    describe('from the button', () => {
      beforeEach(() => {
        component.onSkipCacheToggle();
      });

      it('saves the skip cache flag', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          saveUserPreference({
            name: SKIP_CACHE_PREFERENCE,
            value: `${component.skipCache === false}`
          })
        );
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

      it('saves the skip cache flag', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          saveUserPreference({
            name: SKIP_CACHE_PREFERENCE,
            value: `${component.skipCache === false}`
          })
        );
      });
    });
  });

  describe('toggling matching the publisher', () => {
    beforeEach(() => {
      component.matchPublisher = MATCH_PUBLISHER;
      storeDispatchSpy.calls.reset();
    });

    describe('from the button', () => {
      beforeEach(() => {
        component.onMatchPublisherToggle();
      });

      it('saves the match publisher flag', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          saveUserPreference({
            name: MATCH_PUBLISHER_PREFERENCE,
            value: `${component.matchPublisher === false}`
          })
        );
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

      it('saves the match publisher flag', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          saveUserPreference({
            name: MATCH_PUBLISHER_PREFERENCE,
            value: `${component.matchPublisher === false}`
          })
        );
      });
    });
  });
});
