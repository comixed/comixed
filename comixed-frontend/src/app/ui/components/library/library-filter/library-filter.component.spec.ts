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
import { AppState } from 'app/app.state';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { LibraryFilterComponent } from './library-filter.component';
import * as FilterActions from 'app/actions/library-filter.actions';
import { REDUCERS } from 'app/app.reducers';

describe('LibraryFilterComponent', () => {
  const PUBLISHER = 'DC';
  const SERIES = 'Batman';
  const VOLUME = '1938';
  const FROM_YEAR = 1982;
  const TO_YEAR = 2015;

  let component: LibraryFilterComponent;
  let fixture: ComponentFixture<LibraryFilterComponent>;
  let store: Store<AppState>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        FormsModule,
        TranslateModule.forRoot(),
        StoreModule.forRoot(REDUCERS),
        PanelModule,
        ButtonModule
      ],
      declarations: [LibraryFilterComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LibraryFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    store = TestBed.get(Store);

    spyOn(store, 'dispatch').and.callThrough();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when applying filters', () => {
    beforeEach(() => {
      component.collapsed = false;
      fixture.detectChanges();

      component.publisher = PUBLISHER;
      component.series = SERIES;
      component.volume = VOLUME;
      component.from_year = FROM_YEAR;
      component.to_year = TO_YEAR;

      component.apply_filters();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        new FilterActions.LibraryFilterSetFilters({
          publisher: PUBLISHER,
          series: SERIES,
          volume: VOLUME,
          from_year: FROM_YEAR,
          to_year: TO_YEAR
        })
      );
    });

    it('closes the filter panel', () => {
      expect(component.collapsed).toBeTruthy();
    });
  });

  describe('when resetting the filters', () => {
    beforeEach(() => {
      component.collapsed = false;
      fixture.detectChanges();

      component.reset_filters();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        new FilterActions.LibraryFilterReset()
      );
    });

    it('closes the filter panel', () => {
      expect(component.collapsed).toBeTruthy();
    });
  });

  describe('generating the filter header', () => {
    beforeEach(() => {
      component.publisher = '';
      component.series = '';
      component.volume = '';
      component.from_year = null;
      component.to_year = null;
    });

    it('includes the publisher when in use', () => {
      component.publisher = PUBLISHER;
      expect(component.get_header()).toContain(
        'library-filter.filters.publisher'
      );
    });

    it('includes the series when in use', () => {
      component.series = SERIES;
      expect(component.get_header()).toContain('library-filter.filters.series');
    });

    it('includes the volume when in use', () => {
      component.volume = VOLUME;
      expect(component.get_header()).toContain('library-filter.filters.volume');
    });

    it('includes the from year when in use', () => {
      component.from_year = FROM_YEAR;
      expect(component.get_header()).toContain(
        'library-filter.filters.from-year'
      );
    });

    it('includes the to year when in use', () => {
      component.to_year = TO_YEAR;
      expect(component.get_header()).toContain(
        'library-filter.filters.to-year'
      );
    });

    it('includes the date range when both to and from year are in use', () => {
      component.from_year = FROM_YEAR;
      component.to_year = TO_YEAR;
      expect(component.get_header()).toContain(
        'library-filter.filters.between-years'
      );
    });

    it('displays a default label when no filters are in use', () => {
      expect(component.get_header()).toEqual(
        'library-filter.filters.no-filters'
      );
    });
  });
});
