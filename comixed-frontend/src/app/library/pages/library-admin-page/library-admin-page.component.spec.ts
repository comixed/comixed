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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LibraryAdminPageComponent } from './library-admin-page.component';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { TranslateModule } from '@ngx-translate/core';
import { FileSaverModule } from 'ngx-filesaver';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { UserService } from 'app/services/user.service';
import { LibraryAdaptor } from 'app/library';
import { BreadcrumbAdaptor } from 'app/adaptors/breadcrumb.adaptor';
import { RouterTestingModule } from '@angular/router/testing';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { LoggerModule } from '@angular-ru/logger';
import { ConsolidateLibraryComponent } from 'app/library/components/consolidate-library/consolidate-library.component';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserModule } from 'app/user/user.module';
import { ComicsModule } from 'app/comics/comics.module';
import {
  MOVE_COMICS_FEATURE_KEY,
  reducer
} from 'app/library/reducers/move-comics.reducer';
import { MoveComicsEffects } from 'app/library/effects/move-comics.effects';

describe('LibraryAdminPageComponent', () => {
  let component: LibraryAdminPageComponent;
  let fixture: ComponentFixture<LibraryAdminPageComponent>;
  let rescanButton: DebugElement;
  let exportButton: DebugElement;
  let libraryAdaptor: LibraryAdaptor;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        UserModule,
        ComicsModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        RouterTestingModule,
        BrowserAnimationsModule,
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        LoggerModule.forRoot(),
        StoreModule.forRoot({}),
        StoreModule.forFeature(MOVE_COMICS_FEATURE_KEY, reducer),
        EffectsModule.forRoot([]),
        EffectsModule.forFeature([MoveComicsEffects]),
        FileSaverModule,
        ButtonModule,
        PanelModule,
        CheckboxModule
      ],
      declarations: [LibraryAdminPageComponent, ConsolidateLibraryComponent],
      providers: [
        LibraryAdaptor,
        MessageService,
        UserService,
        BreadcrumbAdaptor,
        ConfirmationService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LibraryAdminPageComponent);
    component = fixture.componentInstance;
    libraryAdaptor = TestBed.get(LibraryAdaptor);

    fixture.detectChanges();

    rescanButton = fixture.debugElement.query(By.css('#cx-rescan-button'));
    exportButton = fixture.debugElement.query(By.css('#cx-export-button'));
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when an import is in process', () => {
    beforeEach(() => {
      component.importCount = 12;
      fixture.detectChanges();
    });

    it('disables the rescan button', () => {
      expect(rescanButton.nativeElement.disabled).toBeTruthy();
    });

    it('disables the backup button', () => {
      expect(exportButton.nativeElement.disabled).toBeTruthy();
    });
  });

  describe('when not rescanning', () => {
    beforeEach(() => {
      component.importCount = 0;
      fixture.detectChanges();
    });

    it('enables the rescan button', () => {
      expect(rescanButton.nativeElement.disabled).toBeFalsy();
    });

    it('enables the export button', () => {
      expect(exportButton.nativeElement.disabled).toBeFalsy();
    });

    describe('and a rescan is requested', () => {
      beforeEach(() => {
        spyOn(libraryAdaptor, 'startRescan');
        component.rescanLibrary();
        fixture.detectChanges();
      });

      it('sends a notice to start a rescan', () => {
        expect(libraryAdaptor.startRescan).toHaveBeenCalled();
      });
    });
  });
});
