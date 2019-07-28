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

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import * as LibraryActions from 'app/actions/library.actions';
import { LibraryAdminPageComponent } from './library-admin-page.component';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { AppState } from 'app/app.state';
import { TranslateModule } from '@ngx-translate/core';
import { FileSaverModule } from 'ngx-filesaver';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { COMIC_1001 } from 'app/models/comics/comic.fixtures';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { REDUCERS } from 'app/app.reducers';

describe('LibraryAdminPageComponent', () => {
  let component: LibraryAdminPageComponent;
  let fixture: ComponentFixture<LibraryAdminPageComponent>;
  let store: Store<AppState>;
  let rescan_button: DebugElement;
  let export_button: DebugElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        FileSaverModule,
        StoreModule.forRoot(REDUCERS),
        ButtonModule,
        PanelModule
      ],
      declarations: [LibraryAdminPageComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LibraryAdminPageComponent);
    component = fixture.componentInstance;
    store = TestBed.get(Store);
    store.dispatch(new LibraryActions.LibraryReset());
    spyOn(store, 'dispatch').and.callThrough();

    fixture.detectChanges();

    rescan_button = fixture.debugElement.query(By.css('#cx-rescan-button'));
    export_button = fixture.debugElement.query(By.css('#cx-export-button'));
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('#ngOnInit()', () => {
    beforeEach(() => {
      store.dispatch(
        new LibraryActions.LibraryMergeNewComics({
          library_state: {
            comics: [COMIC_1001],
            rescan_count: 12,
            import_count: 4
          }
        })
      );
      fixture.detectChanges();
    });

    it('subscribes to library updates', () => {
      expect(component.library.comics).toEqual([COMIC_1001]);
      expect(component.library.library_contents.rescan_count).toEqual(12);
      expect(component.library.library_contents.import_count).toEqual(4);
    });
  });

  describe('when an import is in process', () => {
    beforeEach(() => {
      component.library.library_contents = {
        import_count: 12,
        rescan_count: 0,
        comics: []
      };
      fixture.detectChanges();
    });

    it('disables the rescan button', () => {
      expect(rescan_button.nativeElement.disabled).toBeTruthy();
    });

    it('disables the backup button', () => {
      expect(export_button.nativeElement.disabled).toBeTruthy();
    });
  });

  describe('when not rescanning', () => {
    beforeEach(() => {
      component.library.library_contents = {
        import_count: 0,
        rescan_count: 0,
        comics: []
      };
      fixture.detectChanges();
    });

    it('enables the rescan button', () => {
      expect(rescan_button.nativeElement.disabled).toBeFalsy();
    });

    it('enables the export button', () => {
      expect(export_button.nativeElement.disabled).toBeFalsy();
    });

    describe('#rescan_library()', () => {
      beforeEach(() => {
        component.rescan_library();
        fixture.detectChanges();
      });

      it('sends a notice to start a rescan', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          new LibraryActions.LibraryRescanFiles({
            last_comic_date: '0',
            timeout: 60000
          })
        );
      });
    });
  });

  describe('when rescanning', () => {
    beforeEach(() => {
      component.library.library_contents.rescan_count = 3;
      fixture.detectChanges();
    });

    it('disables the rescan button', () => {
      expect(rescan_button.nativeElement.disabled).toBeTruthy();
    });

    it('disables the export button', () => {
      expect(export_button.nativeElement.disabled).toBeTruthy();
    });

    describe('#rescan_library()', () => {
      beforeEach(() => {
        component.rescan_library();
        fixture.detectChanges();
      });

      it('does not send a notice to start a rescan', () => {
        expect(store.dispatch).not.toHaveBeenCalled();
      });
    });
  });
});
