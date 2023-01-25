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
import { FetchIssuesPageComponent } from './fetch-issues-page.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatDialogModule } from '@angular/material/dialog';
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
  METADATA_FEATURE_KEY
} from '@app/comic-metadata/reducers/metadata.reducer';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  METADATA_SOURCE_1,
  METADATA_SOURCE_2,
  SCRAPING_VOLUME_1
} from '@app/comic-metadata/comic-metadata.fixtures';
import { TitleService } from '@app/core/services/title.service';
import { SKIP_CACHE_PREFERENCE } from '@app/library/library.constants';
import { Preference } from '@app/user/models/preference';
import { loadVolumeMetadata } from '@app/comic-metadata/actions/metadata.actions';
import {
  Confirmation,
  ConfirmationService
} from '@tragically-slick/confirmation';
import { fetchIssuesForSeries } from '@app/comic-metadata/actions/fetch-issues-for-series.actions';
import {
  FETCH_ISSUES_FOR_SERIES_FEATURE_KEY,
  initialState as initialFetchIssuesForSeriesState
} from '@app/comic-metadata/reducers/fetch-issues-for-series.reducer';

describe('FetchIssuesPageComponent', () => {
  const SERIES = 'The Series';
  const SCRAPING_VOLUME = SCRAPING_VOLUME_1;
  const METADATA_SOURCE = METADATA_SOURCE_2;
  const initialState = {
    [USER_FEATURE_KEY]: { ...initialUserState, user: USER_ADMIN },
    [METADATA_SOURCE_LIST_FEATURE_KEY]: {
      ...initialMetadataSourceListState,
      sources: [{ ...METADATA_SOURCE_1, preferred: true }, METADATA_SOURCE_2]
    },
    [METADATA_FEATURE_KEY]: { ...initialMetadataState },
    [FETCH_ISSUES_FOR_SERIES_FEATURE_KEY]: {
      ...initialFetchIssuesForSeriesState
    }
  };

  let component: FetchIssuesPageComponent;
  let fixture: ComponentFixture<FetchIssuesPageComponent>;
  let store: MockStore<any>;
  let translateService: TranslateService;
  let titleService: TitleService;
  let confirmationService: ConfirmationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FetchIssuesPageComponent, VolumeMetadataTableComponent],
      imports: [
        NoopAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule.withRoutes([{ path: '*', redirectTo: '' }]),
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
        MatInputModule
      ],
      providers: [
        provideMockStore({ initialState }),
        TitleService,
        ConfirmationService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FetchIssuesPageComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    translateService = TestBed.inject(TranslateService);
    titleService = TestBed.inject(TitleService);
    confirmationService = TestBed.inject(ConfirmationService);
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
      component.onMetadataSourceSelected(METADATA_SOURCE_2.id);
    });

    it('selects the source', () => {
      expect(component.metadataSource).toEqual(METADATA_SOURCE_2);
    });
  });

  describe('fetching issues', () => {
    beforeEach(() => {
      component.metadataSource = METADATA_SOURCE_2;
      component.series = SERIES;
      component.onFetchIssues();
    });

    it('dispatches an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        loadVolumeMetadata({
          metadataSource: METADATA_SOURCE_2,
          series: SERIES,
          skipCache: false,
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
        fetchIssuesForSeries({
          source: METADATA_SOURCE,
          volume: SCRAPING_VOLUME
        })
      );
    });
  });
});
