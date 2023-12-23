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
import { provideMockStore } from '@ngrx/store/testing';
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

describe('LibraryPluginsConfigurationComponent', () => {
  const initialState = {
    [LIBRARY_PLUGIN_FEATURE_KEY]: initialLibraryPluginListState
  };

  let component: LibraryPluginsConfigurationComponent;
  let fixture: ComponentFixture<LibraryPluginsConfigurationComponent>;
  let dialog: MatDialog;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        LibraryPluginsConfigurationComponent,
        CreatePluginDialogComponent
      ],
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
        MatSortModule
      ],
      providers: [provideMockStore({ initialState })]
    }).compileComponents();

    fixture = TestBed.createComponent(LibraryPluginsConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    dialog = TestBed.inject(MatDialog);
    spyOn(dialog, 'open');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('installing a new plugin', () => {
    beforeEach(() => {
      component.onShowCreatePluginForm();
    });

    it('opens the create plugin dialog', () => {
      expect(dialog.open).toHaveBeenCalledWith(CreatePluginDialogComponent);
    });
  });
});
