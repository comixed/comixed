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
import { CreatePluginDialogComponent } from './create-plugin-dialog.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import {
  initialState as initialPluginLanguageState,
  PLUGIN_LANGUAGE_FEATURE_KEY
} from '@app/library-plugins/reducers/plugin-language.reducer';
import {
  Confirmation,
  ConfirmationService
} from '@tragically-slick/confirmation';
import { LIBRARY_PLUGIN_4 } from '@app/library-plugins/library-plugins.fixtures';
import { createLibraryPlugin } from '@app/library-plugins/actions/library-plugin.actions';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('CreatePluginDialogComponent', () => {
  const initialState = {
    [PLUGIN_LANGUAGE_FEATURE_KEY]: initialPluginLanguageState
  };
  const PLUGIN = LIBRARY_PLUGIN_4;

  let component: CreatePluginDialogComponent;
  let fixture: ComponentFixture<CreatePluginDialogComponent>;
  let store: MockStore;
  let confirmationService: ConfirmationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreatePluginDialogComponent],
      imports: [
        NoopAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatDialogModule,
        MatCardModule,
        MatFormFieldModule,
        MatSelectModule,
        MatIconModule,
        MatInputModule
      ],
      providers: [provideMockStore({ initialState })]
    }).compileComponents();

    fixture = TestBed.createComponent(CreatePluginDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    confirmationService = TestBed.inject(ConfirmationService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('creating the plugin', () => {
    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.pluginForm.controls.filename.setValue(PLUGIN.filename);
      component.pluginForm.controls.language.setValue(PLUGIN.language);
      component.onCreatePlugin();
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
});
