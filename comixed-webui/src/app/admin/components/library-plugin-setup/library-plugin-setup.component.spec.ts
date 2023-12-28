/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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
import { LibraryPluginSetupComponent } from './library-plugin-setup.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { LIBRARY_PLUGIN_4 } from '@app/library-plugins/library-plugins.fixtures';
import { PluginTitlePipe } from '@app/library-plugins/pipes/plugin-title.pipe';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  Confirmation,
  ConfirmationService
} from '@tragically-slick/confirmation';
import {
  setCurrentLibraryPlugin,
  updateLibraryPlugin
} from '@app/library-plugins/actions/library-plugin.actions';

describe('LibraryPluginSetupComponent', () => {
  const initialState = {};
  const PLUGIN = LIBRARY_PLUGIN_4;

  let component: LibraryPluginSetupComponent;
  let fixture: ComponentFixture<LibraryPluginSetupComponent>;
  let confirmationService: ConfirmationService;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LibraryPluginSetupComponent, PluginTitlePipe],
      imports: [
        NoopAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatDialogModule,
        MatSnackBarModule,
        MatFormFieldModule,
        MatCardModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule
      ],
      providers: [
        provideMockStore({ initialState }),
        { provide: MAT_DIALOG_DATA, useValue: PLUGIN }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LibraryPluginSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    confirmationService = TestBed.inject(ConfirmationService);
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('saving changes', () => {
    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.onSave();
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        updateLibraryPlugin({ plugin: component.encodePlugin() })
      );
    });
  });

  describe('resetting changes', () => {
    beforeEach(() => {
      console.log(
        '*** component.properties.controls[0].value:',
        component.properties.controls[0].value
      );
      component.properties.controls[0].value.propertyValue = 'FARKLE!';

      component.onReset();
    });

    it('resets the plugin property values', () => {
      console.log('*** encoded:', component.encodePlugin());
      console.log('*** PLUGIN:', PLUGIN);
      expect(component.encodePlugin()).toEqual(PLUGIN);
    });
  });

  describe('closing the change dialog', () => {
    beforeEach(() => {
      component.onClose();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        setCurrentLibraryPlugin({ plugin: null })
      );
    });
  });
});
