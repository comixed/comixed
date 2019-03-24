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
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { Store, StoreModule } from '@ngrx/store';
import { AppState } from '../../../../app.state';
import * as LibraryActions from '../../../../actions/library.actions';
import { InplaceModule } from 'primeng/inplace';
import { DropdownModule } from 'primeng/dropdown';
import { COMIC_1000, COMIC_1001, COMIC_1002, COMIC_1003 } from '../../../../models/comics/comic.fixtures';
import { EXISTING_LIBRARY } from '../../../../models/actions/library.fixtures';
import { ComicOverviewComponent } from './comic-overview.component';
import { libraryReducer } from '../../../../reducers/library.reducer';
import {
  DEFAULT_COMIC_FORMAT_1,
  DEFAULT_COMIC_FORMAT_2,
  DEFAULT_COMIC_FORMAT_3
} from '../../../../models/comics/comic-format.fixtures';
import { SelectItem } from 'primeng/api';
import {
  FIRST_SCAN_TYPE,
  FOURTH_SCAN_TYPE,
  SECOND_SCAN_TYPE,
  THIRD_SCAN_TYPE
} from '../../../../models/comics/scan-type.fixtures';
import { EXISTING_COMIC_FILE_1 } from '../../../../models/import/comic-file.fixtures';
import { COMIC_1000_LAST_READ_DATE } from '../../../../models/comics/last-read-date.fixtures';

describe('ComicOverviewComponent', () => {
  let component: ComicOverviewComponent;
  let fixture: ComponentFixture<ComicOverviewComponent>;
  let store: Store<AppState>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        RouterTestingModule,
        TranslateModule.forRoot(),
        StoreModule.forRoot({ library: libraryReducer }),
        InplaceModule,
        DropdownModule
      ],
      declarations: [ComicOverviewComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicOverviewComponent);
    component = fixture.componentInstance;
    component.is_admin = false;
    component.comic = COMIC_1000;
    component.library = EXISTING_LIBRARY;
    component.library.library_state.comics = [
      COMIC_1000,
      COMIC_1001,
      COMIC_1002,
      COMIC_1003
    ];
    component.library.last_read_dates = [
      COMIC_1000_LAST_READ_DATE
    ];
    component.library.scan_types = [
      FIRST_SCAN_TYPE,
      SECOND_SCAN_TYPE,
      THIRD_SCAN_TYPE,
      FOURTH_SCAN_TYPE
    ];
    component.library.formats = [
      DEFAULT_COMIC_FORMAT_1,
      DEFAULT_COMIC_FORMAT_2,
      DEFAULT_COMIC_FORMAT_3
    ];
    store = TestBed.get(Store);

    spyOn(store, 'dispatch');

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('#ngOnInit()', () => {
    it('sets the format to that of the comic', () => {
      expect(component.format).toEqual(COMIC_1000.format);
    });

    it('gets the available formats from the library', () => {
      expect(component.formats).not.toBeFalsy();
      expect(component.formats.length).toEqual(4);
      expect(component.formats[1].label).toEqual(DEFAULT_COMIC_FORMAT_1.name);
      expect(component.formats[1].value).toEqual(DEFAULT_COMIC_FORMAT_1);
      expect(component.formats[2].label).toEqual(DEFAULT_COMIC_FORMAT_2.name);
      expect(component.formats[2].value).toEqual(DEFAULT_COMIC_FORMAT_2);
      expect(component.formats[3].label).toEqual(DEFAULT_COMIC_FORMAT_3.name);
      expect(component.formats[3].value).toEqual(DEFAULT_COMIC_FORMAT_3);
    });

    it('sets the scan type to that of the comic', () => {
      expect(component.scan_type).toEqual(COMIC_1000.scan_type);
    });

    it('gets the available scan types from the library', () => {
      expect(component.scan_types).not.toBeFalsy();
      expect(component.scan_types.length).toEqual(5);
      expect(component.scan_types[1].label).toEqual(FIRST_SCAN_TYPE.name);
      expect(component.scan_types[1].value).toEqual(FIRST_SCAN_TYPE);
      expect(component.scan_types[2].label).toEqual(SECOND_SCAN_TYPE.name);
      expect(component.scan_types[2].value).toEqual(SECOND_SCAN_TYPE);
      expect(component.scan_types[3].label).toEqual(THIRD_SCAN_TYPE.name);
      expect(component.scan_types[3].value).toEqual(THIRD_SCAN_TYPE);
      expect(component.scan_types[4].label).toEqual(FOURTH_SCAN_TYPE.name);
      expect(component.scan_types[4].value).toEqual(FOURTH_SCAN_TYPE);
    });
  });

  describe('#copy_comic_format()', () => {
    beforeEach(() => {
      component.format = null;
      component.copy_comic_format(COMIC_1000);
    });

    it('copies the format from a given comic', () => {
      expect(component.format).toEqual(COMIC_1000.format);
    });
  });

  describe('#set_comic_format()', () => {
    beforeEach(() => {
      component.set_comic_format(COMIC_1000, DEFAULT_COMIC_FORMAT_3);
      fixture.detectChanges();
    });

    it('sends a notification', () => {
      expect(store.dispatch).toHaveBeenCalledWith(new LibraryActions.LibrarySetFormat({
          comic: COMIC_1000,
          format: DEFAULT_COMIC_FORMAT_3
        })
      );
    });
  });

  describe('#copy_scan_type()', () => {
    beforeEach(() => {
      component.scan_type = null;
      component.copy_scan_type(COMIC_1000);
    });

    it('copies the scan type from a given comic', () => {
      expect(component.scan_type).toEqual(COMIC_1000.scan_type);
    });
  });

  describe('#set_scan_type()', () => {
    beforeEach(() => {
      component.set_scan_type(COMIC_1000, THIRD_SCAN_TYPE);
      fixture.detectChanges();
    });

    it('sends a notification', () => {
      expect(store.dispatch).toHaveBeenCalledWith(new LibraryActions.LibrarySetScanType({
          comic: COMIC_1000,
          scan_type: THIRD_SCAN_TYPE
        })
      );
    });
  });

  describe('#copy_sort_name()', () => {
    beforeEach(() => {
      component.sort_name = null;
      component.copy_sort_name(COMIC_1000);
    });

    it('copies the scan type from a given comic', () => {
      expect(component.sort_name).toEqual(COMIC_1000.sort_name);
    });
  });

  describe('#save_sort_name()', () => {
    beforeEach(() => {
      component.sort_name = 'New Sort Name';
      component.save_sort_name(COMIC_1000);
      fixture.detectChanges();
    });

    it('sends a notification', () => {
      expect(store.dispatch).toHaveBeenCalledWith(new LibraryActions.LibrarySetSortName({
          comic: COMIC_1000,
          sort_name: 'New Sort Name'
        })
      );
    });
  });

  describe('#clear_metadata()', () => {
    beforeEach(() => {
      component.clear_metadata();
      fixture.detectChanges();
    });

    it('sends a notification', () => {
      expect(store.dispatch).toHaveBeenCalledWith(new LibraryActions.LibraryClearMetadata({
        comic: COMIC_1000
      }));
    });
  });

  describe('#get_last_read_date()', () => {
    it('returns the last read date for the comic', () => {
      expect(component.get_last_read_date(COMIC_1000)).toEqual(COMIC_1000_LAST_READ_DATE.last_read_date);
    });

    it('returns null when the comic has not been read', () => {
      expect(component.get_last_read_date(COMIC_1003)).toBeFalsy();
    });
  });
});
