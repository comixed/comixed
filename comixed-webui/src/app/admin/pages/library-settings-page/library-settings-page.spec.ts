/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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
import { LibrarySettingsPage } from './library-settings-page';
import { beforeEach, Mock } from 'vitest';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { provideTranslateService } from '@ngx-translate/core';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { provideRouter } from '@angular/router';
import {
  CONFIGURATION_FEATURE_KEY,
  initialConfigurationState
} from '@app/settings/reducers/configuration.reducer';
import { ConfigurationOption } from '@app/settings/models/configuration-option';
import { LIBRARY_ROOT_DIRECTORY } from '@app/admin/admin-configuration-options';

describe('LibrarySettingsPage', () => {
  const TEST_ROOT_DIRECTORY = '/home/comixed/library/root';
  const TEST_CONFIGURATION_OPTION_LIST = [
    {
      name: LIBRARY_ROOT_DIRECTORY,
      value: TEST_ROOT_DIRECTORY
    } as ConfigurationOption
  ];
  const initialState = {
    [CONFIGURATION_FEATURE_KEY]: initialConfigurationState
  };

  let component: LibrarySettingsPage;
  let fixture: ComponentFixture<LibrarySettingsPage>;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LibrarySettingsPage],
      providers: [
        provideRouter([
          {
            path: '*',
            redirectTo: ''
          }
        ]),
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideTranslateService(),
        provideMockStore({ initialState })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LibrarySettingsPage);
    component = fixture.componentInstance;
    component.options = TEST_CONFIGURATION_OPTION_LIST;
    store = TestBed.inject(MockStore);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when the language changes', () => {
    let setTitleSpy: Mock;

    beforeEach(() => {
      setTitleSpy = vi.spyOn(component.titleService, 'setTitle');
      component.translateService.use('fr');
    });

    it('updates the tab title', () => {
      expect(setTitleSpy).toHaveBeenCalled();
    });
  });

  describe('saving the settings', () => {
    let dispatchSpy: Mock;

    beforeEach(() => {
      dispatchSpy = vi.spyOn(store, 'dispatch');
      const button: HTMLButtonElement = fixture.nativeElement.querySelector(
        '#save-configuration-changes button'
      );
      button.click();
    });

    it('should dispatch an action to save the options', () => {
      expect(dispatchSpy).toHaveBeenCalled();
    });
  });

  describe('resetting changes', () => {
    let resetButton: HTMLButtonElement;

    beforeEach(() => {
      component.configurationForm.controls['rootDirectory'].setValue(
        TEST_ROOT_DIRECTORY.substring(1)
      );
      component.configurationForm.markAsDirty();
      fixture.detectChanges();
      resetButton = fixture.nativeElement.querySelector(
        '#reset-configuration-changes button'
      );
      expect(resetButton.disabled).toBeFalsy();
      resetButton.click();
      fixture.detectChanges();
    });

    it('should reset the form', () => {
      expect(
        component.configurationForm.controls['rootDirectory'].value
      ).toStrictEqual(TEST_ROOT_DIRECTORY);
    });

    it('should disable the reset button', () => {
      expect(resetButton.disabled).toBeTruthy();
    });
  });
});
