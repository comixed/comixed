/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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

import {
  NavigationBarComponent,
  USER_PREFERENCE_DEBUGGING,
  USER_PREFERENCE_LANGUAGE
} from './navigation-bar.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DropdownModule } from 'primeng/dropdown';
import {
  ButtonModule,
  MenuModule,
  MessageService,
  ToolbarModule
} from 'primeng/primeng';
import { LoggerLevel, LoggerModule } from '@angular-ru/logger';
import { FormsModule } from '@angular/forms';
import { UserModule } from 'app/user/user.module';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthenticationAdaptor, USER_READER } from 'app/user';
import { LibraryModule } from 'app/library/library.module';
import { Confirmation, ConfirmationService } from 'primeng/api';

describe('NavigationBarComponent', () => {
  const USER = USER_READER;

  let component: NavigationBarComponent;
  let fixture: ComponentFixture<NavigationBarComponent>;
  let translateService: TranslateService;
  let authenticationAdaptor: AuthenticationAdaptor;
  let confirmationService: ConfirmationService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        UserModule,
        LibraryModule,
        HttpClientTestingModule,
        RouterTestingModule,
        FormsModule,
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        StoreModule.forRoot({}),
        EffectsModule.forRoot([]),
        DropdownModule,
        ToolbarModule,
        ButtonModule,
        MenuModule
      ],
      declarations: [NavigationBarComponent],
      providers: [MessageService, AuthenticationAdaptor, ConfirmationService]
    }).compileComponents();

    fixture = TestBed.createComponent(NavigationBarComponent);
    component = fixture.componentInstance;
    confirmationService = TestBed.get(ConfirmationService);
    translateService = TestBed.get(TranslateService);
    spyOn(translateService, 'use').and.callThrough();
    authenticationAdaptor = TestBed.get(AuthenticationAdaptor);
    spyOn(authenticationAdaptor, 'setPreference');
    spyOn(authenticationAdaptor, 'getPreference');
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when loading a difference language', () => {
    beforeEach(() => {
      component.menuItems = [];
      component.languageOptions = [];
      translateService.use('fr');
    });

    it('reloads the menu items', () => {
      expect(component.menuItems).not.toEqual([]);
    });

    it('loads the language options', () => {
      expect(component.languageOptions).not.toEqual([]);
    });
  });

  describe('when the user is logged in', () => {
    beforeEach(() => {
      component.user = USER;
    });

    it('loads their debugging preference', () => {
      expect(authenticationAdaptor.getPreference).toHaveBeenCalledWith(
        USER_PREFERENCE_DEBUGGING
      );
    });

    it('loads their language preference', () => {
      expect(authenticationAdaptor.getPreference).toHaveBeenCalledWith(
        USER_PREFERENCE_LANGUAGE
      );
    });

    describe('turning debugging on', () => {
      beforeEach(() => {
        component.toggleDebugging(true);
      });

      it('saves the changes', () => {
        expect(authenticationAdaptor.setPreference).toHaveBeenCalledWith(
          USER_PREFERENCE_DEBUGGING,
          'true'
        );
      });

      it('changes the logging level', () => {
        expect(component.logger.level).toEqual(LoggerLevel.DEBUG);
      });
    });

    describe('turning debugging off', () => {
      beforeEach(() => {
        component.toggleDebugging(false);
      });

      it('saves the changes', () => {
        expect(authenticationAdaptor.setPreference).toHaveBeenCalledWith(
          USER_PREFERENCE_DEBUGGING,
          'false'
        );
      });

      it('changes the logging level', () => {
        expect(component.logger.level).toEqual(LoggerLevel.INFO);
      });
    });

    describe('changing languages', () => {
      const LANGUAGE = 'fr';

      beforeEach(() => {
        component.language = '';
        component.changeLanguage(LANGUAGE);
      });

      it('loads the language', () => {
        expect(translateService.use).toHaveBeenCalledWith(LANGUAGE);
      });

      it('sets the language', () => {
        expect(component.language).toEqual(LANGUAGE);
      });

      it('saves the language preference', () => {
        expect(authenticationAdaptor.setPreference).toHaveBeenCalledWith(
          USER_PREFERENCE_LANGUAGE,
          LANGUAGE
        );
      });
    });
  });

  describe('when no user is logged in', () => {
    beforeEach(() => {
      component.isAdmin = true;
      component.user = null;
    });

    it('turns off debugging', () => {
      expect(component.debugging).toBeFalsy();
    });

    it('clears the admin flag', () => {
      expect(component.isAdmin).toBeFalsy();
    });

    it('sets the language to english', () => {
      expect(translateService.use).toHaveBeenCalledWith('en');
    });

    describe('turning debugging on', () => {
      beforeEach(() => {
        component.toggleDebugging(true);
      });

      it('changes the logging level', () => {
        expect(component.logger.level).toEqual(LoggerLevel.DEBUG);
      });
    });

    describe('turning debugging off', () => {
      beforeEach(() => {
        component.toggleDebugging(false);
      });

      it('changes the logging level', () => {
        expect(component.logger.level).toEqual(LoggerLevel.INFO);
      });
    });

    describe('changing languages', () => {
      const LANGUAGE = 'fr';

      beforeEach(() => {
        component.language = '';
        component.changeLanguage(LANGUAGE);
      });

      it('loads the language', () => {
        expect(translateService.use).toHaveBeenCalledWith(LANGUAGE);
      });

      it('sets the language', () => {
        expect(component.language).toEqual(LANGUAGE);
      });
    });
  });

  describe('user log out', () => {
    beforeEach(() => {
      spyOn(authenticationAdaptor, 'startLogout');
      spyOn(
        confirmationService,
        'confirm'
      ).and.callFake((confirm: Confirmation) => confirm.accept());
      component.logout();
    });

    it('prompts the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('calls the authentication adaptor', () => {
      expect(authenticationAdaptor.startLogout).toHaveBeenCalled();
    });
  });
});
