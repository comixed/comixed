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

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfigurationPageComponent } from './configuration-page.component';
import {
  CONFIGURATION_OPTION_LIST_FEATURE_KEY,
  initialState as initialConfigurationOptionListState
} from '@app/admin/reducers/configuration-option-list.reducer';
import {
  CONFIGURATION_OPTION_1,
  CONFIGURATION_OPTION_2,
  CONFIGURATION_OPTION_3,
  CONFIGURATION_OPTION_4,
  CONFIGURATION_OPTION_5
} from '@app/admin/admin.fixtures';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { ComicVineConfigurationComponent } from '@app/admin/components/comic-vine-configuration/comic-vine-configuration.component';
import { LoggerModule } from '@angular-ru/logger';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TitleService } from '@app/core/services/title.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ConfirmationService } from '@app/core/services/confirmation.service';
import { Confirmation } from '@app/core/models/confirmation';
import { saveConfigurationOptions } from '@app/admin/actions/save-configuration-options.actions';
import { MatDialogModule } from '@angular/material/dialog';
import { COMICVINE_API_KEY } from '@app/admin/admin.constants';

describe('ConfigurationPageComponent', () => {
  const OPTIONS = [
    { ...CONFIGURATION_OPTION_1, name: COMICVINE_API_KEY },
    CONFIGURATION_OPTION_2,
    CONFIGURATION_OPTION_3,
    CONFIGURATION_OPTION_4,
    CONFIGURATION_OPTION_5
  ];
  const initialState = {
    [CONFIGURATION_OPTION_LIST_FEATURE_KEY]: {
      ...initialConfigurationOptionListState,
      options: OPTIONS
    }
  };

  let component: ConfigurationPageComponent;
  let fixture: ComponentFixture<ConfigurationPageComponent>;
  let store: MockStore<any>;
  let translateService: TranslateService;
  let titleService: TitleService;
  let setTitleSpy: jasmine.Spy;
  let confirmationService: ConfirmationService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ConfigurationPageComponent,
        ComicVineConfigurationComponent
      ],
      imports: [
        NoopAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatButtonModule,
        MatToolbarModule,
        MatDialogModule
      ],
      providers: [
        provideMockStore({ initialState }),
        TitleService,
        ConfirmationService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfigurationPageComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    translateService = TestBed.inject(TranslateService);
    titleService = TestBed.inject(TitleService);
    setTitleSpy = spyOn(titleService, 'setTitle');
    confirmationService = TestBed.inject(ConfirmationService);
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('sets the title', () => {
    expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
  });

  describe('when the language changes', () => {
    beforeEach(() => {
      setTitleSpy.calls.reset();
      translateService.use('fr');
    });

    it('updates the title', () => {
      expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('when the user saves the configuration', () => {
    beforeEach(() => {
      store.setState({
        ...initialState,
        [CONFIGURATION_OPTION_LIST_FEATURE_KEY]: {
          ...initialConfigurationOptionListState,
          options: OPTIONS
        }
      });
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.onSaveConfiguration();
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        saveConfigurationOptions({
          options: [
            {
              name: COMICVINE_API_KEY,
              value: component.configurationForm.controls.apiKey.value
            }
          ]
        })
      );
    });
  });
});
