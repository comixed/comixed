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
import { AppState } from 'app/app.state';
import { InplaceModule } from 'primeng/inplace';
import { DropdownModule } from 'primeng/dropdown';
import { COMIC_1, COMIC_2, COMIC_3, COMIC_4 } from 'app/library';
import { ComicOverviewComponent } from './comic-overview.component';
import { FORMAT_1, FORMAT_2, FORMAT_3 } from 'app/library';
import { ConfirmationService, MessageService } from 'primeng/api';
import {
  SCAN_TYPE_1,
  SCAN_TYPE_4,
  SCAN_TYPE_2,
  SCAN_TYPE_3
} from 'app/library';
import { By } from '@angular/platform-browser';
import { REDUCERS } from 'app/app.reducers';
import { LibraryModule } from 'app/library/library.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EffectsModule } from '@ngrx/effects';
import { EFFECTS } from 'app/app.effects';
import { UserService } from 'app/services/user.service';
import { ComicService } from 'app/services/comic.service';
import { LibraryAdaptor } from 'app/library';
import { AuthenticationAdaptor } from 'app/user';
import { scan } from 'rxjs/operators';
import { COMIC_1_LAST_READ_DATE } from 'app/library/models/last-read-date.fixtures';

describe('ComicOverviewComponent', () => {
  const SCAN_TYPES = [SCAN_TYPE_1, SCAN_TYPE_2, SCAN_TYPE_3, SCAN_TYPE_4];
  const COMIC_FORMATS = [FORMAT_1, FORMAT_2, FORMAT_3];
  let component: ComicOverviewComponent;
  let fixture: ComponentFixture<ComicOverviewComponent>;
  let store: Store<AppState>;
  let confirmation_service: ConfirmationService;
  let library_adaptor: LibraryAdaptor;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        LibraryModule,
        HttpClientTestingModule,
        EffectsModule.forRoot(EFFECTS),
        FormsModule,
        RouterTestingModule,
        TranslateModule.forRoot(),
        StoreModule.forRoot(REDUCERS),
        InplaceModule,
        DropdownModule
      ],
      declarations: [ComicOverviewComponent],
      providers: [
        ConfirmationService,
        MessageService,
        UserService,
        ComicService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicOverviewComponent);
    component = fixture.componentInstance;
    component.is_admin = false;
    component.comic = COMIC_1;
    library_adaptor = TestBed.get(LibraryAdaptor);
    library_adaptor._comic$.next([COMIC_1, COMIC_2, COMIC_3, COMIC_4]);
    library_adaptor._last_read_date$.next([COMIC_1_LAST_READ_DATE]);
    library_adaptor._scan_type$.next(SCAN_TYPES);
    library_adaptor._format$.next(COMIC_FORMATS);
    store = TestBed.get(Store);
    spyOn(store, 'dispatch');
    confirmation_service = TestBed.get(ConfirmationService);

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when initialized', () => {
    it('sets the format to that of the comic', () => {
      expect(component.format).toEqual(COMIC_1.format);
    });

    it('gets the available formats from the library', () => {
      expect(component.formats).not.toBeFalsy();
      expect(component.formats.length).toEqual(COMIC_FORMATS.length + 1);
      COMIC_FORMATS.forEach((format, index) => {
        expect(component.formats[index + 1].label).toEqual(format.name);
        expect(component.formats[index + 1].value).toEqual(format);
      });
    });

    it('sets the scan type to that of the comic', () => {
      expect(component.scan_type).toEqual(COMIC_1.scan_type);
    });

    it('gets the available scan types from the library', () => {
      expect(component.scan_types).not.toBeFalsy();
      expect(component.scan_types.length).toEqual(SCAN_TYPES.length);
      SCAN_TYPES.forEach((scan_type, index) => {
        expect(component.scan_types[index].label).toEqual(scan_type.name);
        expect(component.scan_types[index].value).toEqual(scan_type);
      });
    });
  });

  describe('#copy_comic_format()', () => {
    beforeEach(() => {
      component.format = null;
      component.copy_comic_format(COMIC_1);
    });

    it('copies the format from a given comic', () => {
      expect(component.format).toEqual(COMIC_1.format);
    });
  });

  describe('#set_comic_format()', () => {
    beforeEach(() => {
      spyOn(library_adaptor, 'save_comic');
      component.set_comic_format(COMIC_1, FORMAT_3);
      fixture.detectChanges();
    });

    it('sends a notification', () => {
      expect(library_adaptor.save_comic).toHaveBeenCalledWith({
        ...COMIC_1,
        format: FORMAT_3
      });
    });
  });

  describe('#copy_scan_type()', () => {
    beforeEach(() => {
      component.scan_type = null;
      component.copy_scan_type(COMIC_1);
    });

    it('copies the scan type from a given comic', () => {
      expect(component.scan_type).toEqual(COMIC_1.scan_type);
    });
  });

  describe('#set_scan_type()', () => {
    beforeEach(() => {
      spyOn(library_adaptor, 'save_comic');
      component.set_scan_type(COMIC_1, SCAN_TYPE_3);
      fixture.detectChanges();
    });

    it('sends a notification', () => {
      expect(library_adaptor.save_comic).toHaveBeenCalledWith({
        ...COMIC_1,
        scan_type: SCAN_TYPE_3
      });
    });
  });

  describe('#copy_sort_name()', () => {
    beforeEach(() => {
      component.sort_name = null;
      component.copy_sort_name(COMIC_1);
    });

    it('copies the scan type from a given comic', () => {
      expect(component.sort_name).toEqual(COMIC_1.sort_name);
    });
  });

  describe('#save_sort_name()', () => {
    beforeEach(() => {
      spyOn(library_adaptor, 'save_comic');
      component.sort_name = 'New Sort Name';
      component.save_sort_name(COMIC_1);
      fixture.detectChanges();
    });

    it('sends a notification', () => {
      expect(library_adaptor.save_comic).toHaveBeenCalledWith({
        ...COMIC_1,
        sort_name: 'New Sort Name'
      });
    });
  });

  describe('#clear_metadata()', () => {
    it('sends a notification when the user confirms the action', () => {
      spyOn(confirmation_service, 'confirm').and.callFake((params: any) => {
        params.accept();
      });
      spyOn(library_adaptor, 'clear_metadata');

      component.clear_metadata();
      fixture.detectChanges();

      expect(library_adaptor.clear_metadata).toHaveBeenCalledWith(COMIC_1);
    });

    it('does not fire an action when the user declines', () => {
      component.clear_metadata();
      fixture.detectChanges();

      expect(store.dispatch).not.toHaveBeenCalled();
    });
  });

  describe('when getting the last read date', () => {
    it('returns the last read date for the comic', () => {
      expect(component.get_last_read_date(COMIC_1)).toEqual(
        COMIC_1_LAST_READ_DATE.last_read_date
      );
    });

    it('returns null when the comic has not been read', () => {
      expect(component.get_last_read_date(COMIC_4)).toBeNull();
    });
  });

  describe('deleting the comic', () => {
    it('hides the delete button for non-admins', () => {
      component.is_admin = false;
      fixture.detectChanges();
      expect(
        fixture.debugElement.query(By.css('#cx-delete-comic'))
      ).toBeFalsy();
    });

    it('shows the delete button for admins', () => {
      component.is_admin = true;
      fixture.detectChanges();
      expect(
        fixture.debugElement.query(By.css('#cx-delete-comic'))
      ).toBeTruthy();
    });

    describe('when clicking the delete button', () => {
      beforeEach(() => {
        component.is_admin = true;
        fixture.detectChanges();
      });

      it('fires an action when the user confirms', () => {
        spyOn(confirmation_service, 'confirm').and.callFake((params: any) => {
          params.accept();
        });

        fixture.debugElement
          .query(By.css('#cx-delete-comic'))
          .triggerEventHandler('click', null);
        expect(store.dispatch).toHaveBeenCalled();
      });

      it('does not fire an action when the user declines', () => {
        spyOn(confirmation_service, 'confirm').and.callFake((params: any) => {
          return;
        });

        fixture.debugElement
          .query(By.css('#cx-delete-comic'))
          .triggerEventHandler('click', null);
        expect(store.dispatch).not.toHaveBeenCalled();
      });
    });
  });
});
