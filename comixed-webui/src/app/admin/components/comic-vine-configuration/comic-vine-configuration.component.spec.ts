/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ComicVineConfigurationComponent } from './comic-vine-configuration.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TranslateModule } from '@ngx-translate/core';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { ConfirmationService } from '@app/core/services/confirmation.service';
import { MatDialogModule } from '@angular/material/dialog';
import { COMICVINE_API_KEY } from '@app/admin/admin.constants';
import { Confirmation } from '@app/core/models/confirmation';
import { saveConfigurationOptions } from '@app/admin/actions/save-configuration-options.actions';

describe('ComicVineConfigurationComponent', () => {
  const API_KEY = 'The ComicVine API key';
  const OPTIONS = [
    {
      name: COMICVINE_API_KEY,
      value: API_KEY
    }
  ];
  const initialState = {};

  let component: ComicVineConfigurationComponent;
  let fixture: ComponentFixture<ComicVineConfigurationComponent>;
  let store: MockStore<any>;
  let confirmationService: ConfirmationService;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ComicVineConfigurationComponent],
        imports: [
          NoopAnimationsModule,
          FormsModule,
          ReactiveFormsModule,
          LoggerModule.forRoot(),
          TranslateModule.forRoot(),
          MatFormFieldModule,
          MatInputModule,
          MatDialogModule
        ],
        providers: [provideMockStore({ initialState }), ConfirmationService]
      }).compileComponents();

      fixture = TestBed.createComponent(ComicVineConfigurationComponent);
      component = fixture.componentInstance;
      store = TestBed.inject(MockStore);
      spyOn(store, 'dispatch');
      confirmationService = TestBed.inject(ConfirmationService);
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('loading the options', () => {
    beforeEach(() => {
      component.options = OPTIONS;
    });

    it('sets the api key value', () => {
      expect(component.comicVineConfigForm.controls.apiKey.value).toEqual(
        API_KEY
      );
    });
  });

  describe('saving the options', () => {
    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.options = OPTIONS;
      component.onSave();
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        saveConfigurationOptions({
          options: [{ name: COMICVINE_API_KEY, value: API_KEY }]
        })
      );
    });
  });
});
