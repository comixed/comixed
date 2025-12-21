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
import { LibraryPluginsConfigurationComponent } from './library-plugins-configuration.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CreatePluginDialogComponent } from '@app/admin/components/create-plugin-dialog/create-plugin-dialog.component';
import { MatTableModule } from '@angular/material/table';
import {
  initialState as initialLibraryPluginListState,
  LIBRARY_PLUGIN_FEATURE_KEY
} from '@app/library-plugins/reducers/library-plugin.reducer';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSortModule } from '@angular/material/sort';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {
  createLibraryPlugin,
  deleteLibraryPlugin,
  setCurrentLibraryPlugin
} from '@app/library-plugins/actions/library-plugin.actions';
import { LIBRARY_PLUGIN_4 } from '@app/library-plugins/library-plugins.fixtures';
import { AlertService } from '@app/core/services/alert.service';
import {
  Confirmation,
  ConfirmationService
} from '@tragically-slick/confirmation';
import { of } from 'rxjs';
import { CreatePluginDetails } from '@app/admin/models/ui/create-plugin-details';

describe('LibraryPluginsConfigurationComponent', () => {
  const initialState = {
    [LIBRARY_PLUGIN_FEATURE_KEY]: initialLibraryPluginListState
  };
  const PLUGIN = LIBRARY_PLUGIN_4;

  let component: LibraryPluginsConfigurationComponent;
  let fixture: ComponentFixture<LibraryPluginsConfigurationComponent>;
  let dialog: MatDialog;
  let store: MockStore;
  let alertService: AlertService;
  let confirmationService: ConfirmationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        RouterTestingModule.withRoutes([{ path: '*', redirectTo: '' }]),
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatDialogModule,
        MatIconModule,
        MatButtonModule,
        MatTableModule,
        MatTooltipModule,
        MatSortModule,
        MatSnackBarModule,
        LibraryPluginsConfigurationComponent,
        CreatePluginDialogComponent
      ],
      providers: [
        provideMockStore({ initialState }),
        AlertService,
        ConfirmationService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LibraryPluginsConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    dialog = TestBed.inject(MatDialog);
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'info');
    confirmationService = TestBed.inject(ConfirmationService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('installing a new plugin', () => {
    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      const dialogRef = jasmine.createSpyObj(['afterClosed']);
      dialogRef.afterClosed.and.returnValue(
        of({
          filename: PLUGIN.filename,
          language: PLUGIN.language
        } as CreatePluginDetails)
      );
      spyOn(dialog, 'open').and.returnValue(dialogRef);
      component.onShowCreatePluginForm();
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        createLibraryPlugin({
          language: PLUGIN.language,
          filename: PLUGIN.filename
        })
      );
    });
  });

  describe('selecting a plugin', () => {
    beforeEach(() => {
      component.onSelectPlugin(PLUGIN);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        setCurrentLibraryPlugin({ plugin: PLUGIN })
      );
    });
  });

  describe('showing the plugin configuration dialog', () => {
    describe('a plugin with no properties', () => {
      beforeEach(() => {
        component.dialogRef = null;
        store.setState({
          ...initialState,
          [LIBRARY_PLUGIN_FEATURE_KEY]: {
            ...initialLibraryPluginListState,
            current: { ...PLUGIN, properties: [] }
          }
        });
      });

      it('displays an info alert', () => {
        expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
      });

      it('does not create a dialog reference', () => {
        expect(component.dialogRef).toBeNull();
      });
    });

    describe('a plugin with properties', () => {
      beforeEach(() => {
        component.dialogRef = null;
        store.setState({
          ...initialState,
          [LIBRARY_PLUGIN_FEATURE_KEY]: {
            ...initialLibraryPluginListState,
            current: PLUGIN
          }
        });
      });

      it('creates a dialog reference', () => {
        expect(component.dialogRef).not.toBeNull();
      });

      describe('when the dialog is closed', () => {
        beforeEach(() => {
          component.dialogRef = {
            close: jasmine.createSpy('MatDialogRef.close()')
          } as any;
          store.setState({
            ...initialState,
            [LIBRARY_PLUGIN_FEATURE_KEY]: {
              ...initialLibraryPluginListState,
              current: null
            }
          });
        });

        it('clears the dialog reference', () => {
          expect(component.dialogRef).toBeNull();
        });
      });
    });
  });

  describe('deleting a plugin', () => {
    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(confirmation =>
        confirmation.confirm()
      );
      component.onDeletePlugin(PLUGIN);
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        deleteLibraryPlugin({ plugin: PLUGIN })
      );
    });
  });
});
