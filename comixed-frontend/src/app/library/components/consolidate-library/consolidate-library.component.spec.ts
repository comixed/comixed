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

import { ConsolidateLibraryComponent } from './consolidate-library.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { TranslateModule } from '@ngx-translate/core';
import { LoggerModule } from '@angular-ru/logger';
import { ButtonModule } from 'primeng/button';
import { AppState, LibraryAdaptor } from 'app/library';
import { UserModule } from 'app/user/user.module';
import { Store, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import {
  LIBRARY_FEATURE_KEY,
  reducer
} from 'app/library/reducers/library.reducer';
import { LibraryEffects } from 'app/library/effects/library.effects';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Confirmation, ConfirmationService, MessageService } from 'primeng/api';
import { ComicsModule } from 'app/comics/comics.module';
import { AuthUserLoaded } from 'app/user/actions/authentication.actions';
import { AuthenticationAdaptor, USER_ADMIN } from 'app/user';
import {
  MOVE_COMICS_DELETE_PHYSICAL_FILE,
  MOVE_COMICS_RENAMING_RULE,
  MOVE_COMICS_TARGET_DIRECTORY
} from 'app/user/models/preferences.constants';
import { RouterTestingModule } from '@angular/router/testing';

describe('ConsolidateLibraryComponent', () => {
  const DIRECTORY = '/Users/comixedreader/Documents/comics';
  const RENAMING_RULE =
    '$PUBLISHER/$SERIES/$VOLUME/$SERIES v$VOLUME #$ISSUE [$COVERDATE]';

  let component: ConsolidateLibraryComponent;
  let fixture: ComponentFixture<ConsolidateLibraryComponent>;
  let confirmationService: ConfirmationService;
  let libraryAdaptor: LibraryAdaptor;
  let authenticationAdaptor: AuthenticationAdaptor;
  let store: Store<AppState>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        UserModule,
        ComicsModule,
        RouterTestingModule,
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
        TranslateModule,
        StoreModule.forRoot({}),
        StoreModule.forFeature(LIBRARY_FEATURE_KEY, reducer),
        EffectsModule.forRoot([]),
        EffectsModule.forFeature([LibraryEffects]),
        LoggerModule.forRoot(),
        CheckboxModule,
        ButtonModule
      ],
      declarations: [ConsolidateLibraryComponent],
      providers: [LibraryAdaptor, MessageService, ConfirmationService]
    }).compileComponents();

    fixture = TestBed.createComponent(ConsolidateLibraryComponent);
    component = fixture.componentInstance;
    confirmationService = TestBed.get(ConfirmationService);
    libraryAdaptor = TestBed.get(LibraryAdaptor);
    authenticationAdaptor = TestBed.get(AuthenticationAdaptor);
    store = TestBed.get(Store);
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('loading user preferences', () => {
    it('sets the checkbox if the user did before', () => {
      store.dispatch(
        new AuthUserLoaded({
          user: {
            ...USER_ADMIN,
            preferences: [
              { name: MOVE_COMICS_DELETE_PHYSICAL_FILE, value: '1' }
            ]
          }
        })
      );
      expect(
        component.consolidationForm.controls['deletePhysicalFiles'].value
      ).toBeTruthy();
    });

    it('unsets the checkbox if the user did before', () => {
      store.dispatch(
        new AuthUserLoaded({
          user: {
            ...USER_ADMIN,
            preferences: [
              { name: MOVE_COMICS_DELETE_PHYSICAL_FILE, value: '0' }
            ]
          }
        })
      );
      expect(
        component.consolidationForm.controls['deletePhysicalFiles'].value
      ).toBeFalsy();
    });
  });

  describe('consolidating the library', () => {
    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirm: Confirmation) => confirm.accept()
      );
      spyOn(libraryAdaptor, 'consolidate');
      spyOn(authenticationAdaptor, 'setPreference');
    });

    describe('and deletes the physical files', () => {
      beforeEach(() => {
        component.consolidationForm.controls['deletePhysicalFiles'].setValue(
          true
        );
        component.consolidationForm.controls['targetDirectory'].setValue(
          DIRECTORY
        );
        component.consolidationForm.controls['renamingRule'].setValue(
          RENAMING_RULE
        );
        component.consolidateLibrary();
      });

      it('prompts the user', () => {
        expect(confirmationService.confirm).toHaveBeenCalled();
      });

      it('calls the library adaptor', () => {
        expect(libraryAdaptor.consolidate).toHaveBeenCalledWith(
          true,
          DIRECTORY,
          RENAMING_RULE
        );
      });

      it('saves the delete physical files flag as a preference', () => {
        expect(authenticationAdaptor.setPreference).toHaveBeenCalledWith(
          MOVE_COMICS_DELETE_PHYSICAL_FILE,
          '1'
        );
      });

      it('saves the delete physical files flag as a preference', () => {
        expect(authenticationAdaptor.setPreference).toHaveBeenCalledWith(
          MOVE_COMICS_TARGET_DIRECTORY,
          DIRECTORY
        );
      });

      it('saves the delete physical files flag as a preference', () => {
        expect(authenticationAdaptor.setPreference).toHaveBeenCalledWith(
          MOVE_COMICS_RENAMING_RULE,
          RENAMING_RULE
        );
      });
    });

    describe('and does not delete the physical file', () => {
      beforeEach(() => {
        component.consolidationForm.controls['deletePhysicalFiles'].setValue(
          false
        );
        component.consolidationForm.controls['targetDirectory'].setValue(
          DIRECTORY
        );
        component.consolidationForm.controls['renamingRule'].setValue(
          RENAMING_RULE
        );
        component.consolidateLibrary();
      });

      it('prompts the user', () => {
        expect(confirmationService.confirm).toHaveBeenCalled();
      });

      it('calls the library adaptor', () => {
        expect(libraryAdaptor.consolidate).toHaveBeenCalledWith(
          false,
          DIRECTORY,
          RENAMING_RULE
        );
      });

      it('saves the delete physical files flag as a preference', () => {
        expect(authenticationAdaptor.setPreference).toHaveBeenCalledWith(
          MOVE_COMICS_DELETE_PHYSICAL_FILE,
          '0'
        );
      });

      it('saves the delete physical files flag as a preference', () => {
        expect(authenticationAdaptor.setPreference).toHaveBeenCalledWith(
          MOVE_COMICS_TARGET_DIRECTORY,
          DIRECTORY
        );
      });

      it('saves the delete physical files flag as a preference', () => {
        expect(authenticationAdaptor.setPreference).toHaveBeenCalledWith(
          MOVE_COMICS_RENAMING_RULE,
          RENAMING_RULE
        );
      });
    });
  });

  describe('choosing to delete physical files', () => {
    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirm: Confirmation) => confirm.reject()
      );
      component.showDeleteFilesWarning(true);
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });
  });

  describe('choosing not to delete physical files', () => {
    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirm: Confirmation) => confirm.reject()
      );
      component.showDeleteFilesWarning(false);
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).not.toHaveBeenCalled();
    });
  });
});
