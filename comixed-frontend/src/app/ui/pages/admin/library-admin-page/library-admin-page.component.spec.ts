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
import { StoreModule } from '@ngrx/store';
import { LibraryAdminPageComponent } from './library-admin-page.component';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { TranslateModule } from '@ngx-translate/core';
import { FileSaverModule } from 'ngx-filesaver';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { REDUCERS } from 'app/app.reducers';
import { EffectsModule } from '@ngrx/effects';
import { EFFECTS } from 'app/app.effects';
import { MessageService } from 'primeng/api';
import { UserService } from 'app/services/user.service';
import { ComicService } from 'app/services/comic.service';
import { LibraryModule } from 'app/library/library.module';
import { LibraryAdaptor } from 'app/library';
import { BreadcrumbAdaptor } from 'app/adaptors/breadcrumb.adaptor';
import { RouterTestingModule } from '@angular/router/testing';

describe('LibraryAdminPageComponent', () => {
  let component: LibraryAdminPageComponent;
  let fixture: ComponentFixture<LibraryAdminPageComponent>;
  let rescan_button: DebugElement;
  let export_button: DebugElement;
  let library_adaptor: LibraryAdaptor;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        LibraryModule,
        HttpClientTestingModule,
        RouterTestingModule,
        EffectsModule.forRoot(EFFECTS),
        BrowserAnimationsModule,
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        FileSaverModule,
        StoreModule.forRoot(REDUCERS),
        ButtonModule,
        PanelModule
      ],
      declarations: [LibraryAdminPageComponent],
      providers: [MessageService, UserService, ComicService, BreadcrumbAdaptor]
    }).compileComponents();

    fixture = TestBed.createComponent(LibraryAdminPageComponent);
    component = fixture.componentInstance;
    library_adaptor = TestBed.get(LibraryAdaptor);

    fixture.detectChanges();

    rescan_button = fixture.debugElement.query(By.css('#cx-rescan-button'));
    export_button = fixture.debugElement.query(By.css('#cx-export-button'));
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when an import is in process', () => {
    beforeEach(() => {
      component.importCount = 12;
      component.rescanCount = 0;
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
      component.importCount = 0;
      component.rescanCount = 0;
      fixture.detectChanges();
    });

    it('enables the rescan button', () => {
      expect(rescan_button.nativeElement.disabled).toBeFalsy();
    });

    it('enables the export button', () => {
      expect(export_button.nativeElement.disabled).toBeFalsy();
    });

    describe('and a rescan is requested', () => {
      beforeEach(() => {
        spyOn(library_adaptor, 'start_rescan');
        component.rescanLibrary();
        fixture.detectChanges();
      });

      it('sends a notice to start a rescan', () => {
        expect(library_adaptor.start_rescan).toHaveBeenCalled();
      });
    });
  });

  describe('when rescanning', () => {
    beforeEach(() => {
      component.rescanCount = 3;
      fixture.detectChanges();
    });

    it('disables the rescan button', () => {
      expect(rescan_button.nativeElement.disabled).toBeTruthy();
    });

    it('disables the export button', () => {
      expect(export_button.nativeElement.disabled).toBeTruthy();
    });
  });
});
