/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Store, StoreModule } from '@ngrx/store';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import {
  LibraryFilterComponent,
  SHOW_DELETED_COMICS_FILTER
} from './library-filter.component';
import * as fromLibrary from 'app/library/reducers/library.reducer';
import * as fromFilter from 'app/library/reducers/filters.reducer';
import { EffectsModule } from '@ngrx/effects';
import { LibraryEffects } from 'app/library/effects/library.effects';
import { DropdownModule } from 'primeng/dropdown';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MessageService, SelectItem } from 'primeng/api';
import {
  AppState,
  COMIC_1,
  COMIC_2,
  COMIC_3,
  COMIC_4,
  COMIC_5,
  ComicCollectionEntry,
  LibraryAdaptor
} from 'app/library';
import { FilterAdaptor } from 'app/library/adaptors/filter.adaptor';
import { ComicsModule } from 'app/comics/comics.module';
import { RouterTestingModule } from '@angular/router/testing';
import { UserModule } from 'app/user/user.module';
import { CheckboxModule } from 'primeng/checkbox';
import { AuthenticationAdaptor } from 'app/user';
import { LibraryUpdatesReceived } from 'app/library/actions/library.actions';

describe('LibraryFilterComponent', () => {
  const PUBLISHER = 'DC';
  const SERIES = 'Batman';
  const COMIC_UPDATES = [COMIC_1, COMIC_2, COMIC_3, COMIC_4, COMIC_5];

  let component: LibraryFilterComponent;
  let fixture: ComponentFixture<LibraryFilterComponent>;
  let filterAdaptor: FilterAdaptor;
  let authAdaptor: AuthenticationAdaptor;
  let store: Store<AppState>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ComicsModule,
        UserModule,
        RouterTestingModule,
        HttpClientTestingModule,
        BrowserAnimationsModule,
        FormsModule,
        TranslateModule.forRoot(),
        StoreModule.forRoot({}),
        StoreModule.forFeature(
          fromLibrary.LIBRARY_FEATURE_KEY,
          fromLibrary.reducer
        ),
        StoreModule.forFeature(
          fromFilter.FILTERS_FEATURE_KEY,
          fromFilter.reducer
        ),
        EffectsModule.forRoot([]),
        EffectsModule.forFeature([LibraryEffects]),
        PanelModule,
        ButtonModule,
        DropdownModule,
        CheckboxModule
      ],
      providers: [LibraryAdaptor, FilterAdaptor, MessageService],
      declarations: [LibraryFilterComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LibraryFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    filterAdaptor = TestBed.get(FilterAdaptor);
    authAdaptor = TestBed.get(AuthenticationAdaptor);
    store = TestBed.get(Store);
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when comic updates are received', () => {
    const PUBLISHER_NAMES = COMIC_UPDATES.map(comic => comic.publisher).filter(
      (publisher: string, index: number, self: any[]) =>
        self.indexOf(publisher) === index
    );
    const SERIES_NAMES = COMIC_UPDATES.map(comic => comic.series).filter(
      (series: string, index: number, self: any[]) =>
        self.indexOf(series) === index
    );
    beforeEach(() => {
      store.dispatch(
        new LibraryUpdatesReceived({
          comics: COMIC_UPDATES,
          lastReadDates: [],
          processingCount: 0,
          rescanCount: 0
        })
      );
    });

    it('create filter entries for the publishers', () => {
      component.publisherOptions.forEach((entry: SelectItem, index: number) => {
        if (index > 0) {
          expect(entry.label).toEqual(PUBLISHER_NAMES[index - 1]);
          expect(entry.value).toEqual(PUBLISHER_NAMES[index - 1]);
        }
      });
    });

    it('includes a publisher filter to show all publishers', () => {
      expect(component.publisherOptions[0].value).toBeNull();
    });

    it('create filter entries for the series', () => {
      component.seriesOptions.forEach((entry: SelectItem, index: number) => {
        if (index > 0) {
          expect(entry.label).toEqual(SERIES_NAMES[index - 1]);
          expect(entry.value).toEqual(SERIES_NAMES[index - 1]);
        }
      });
    });

    it('includes a series filter to show all series', () => {
      expect(component.seriesOptions[0].value).toBeNull();
    });
  });

  describe('resetting the filters', () => {
    beforeEach(() => {
      spyOn(filterAdaptor, 'clearFilters');
      component.resetFilters();
    });

    it('updates the filter state', () => {
      expect(filterAdaptor.clearFilters).toHaveBeenCalled();
    });
  });

  describe('setting the publisher filter', () => {
    beforeEach(() => {
      spyOn(filterAdaptor, 'setPublisher');
      component.setPublisher(PUBLISHER);
    });

    it('updates the filter state', () => {
      expect(filterAdaptor.setPublisher).toHaveBeenCalledWith(PUBLISHER);
    });
  });

  describe('setting the series filter', () => {
    beforeEach(() => {
      spyOn(filterAdaptor, 'setSeries');
      component.setSeries(SERIES);
    });

    it('updates the filter state', () => {
      expect(filterAdaptor.setSeries).toHaveBeenCalledWith(SERIES);
    });
  });

  describe('showing deleting comics', () => {
    beforeEach(() => {
      spyOn(filterAdaptor, 'showDeletedComics');
      spyOn(authAdaptor, 'setPreference');
      component.setShowDeleted(true);
    });

    it('delegates the filter adaptor', () => {
      expect(filterAdaptor.showDeletedComics).toHaveBeenCalledWith(true);
    });

    it('updates the user preferences', () => {
      authAdaptor.setPreference(SHOW_DELETED_COMICS_FILTER, 'true');
    });
  });

  describe('showing deleting comics', () => {
    beforeEach(() => {
      spyOn(filterAdaptor, 'showDeletedComics');
      spyOn(authAdaptor, 'setPreference');
      component.setShowDeleted(false);
    });

    it('delegates the filter adaptor', () => {
      expect(filterAdaptor.showDeletedComics).toHaveBeenCalledWith(false);
    });

    it('updates the user preferences', () => {
      authAdaptor.setPreference(SHOW_DELETED_COMICS_FILTER, 'false');
    });
  });
});
