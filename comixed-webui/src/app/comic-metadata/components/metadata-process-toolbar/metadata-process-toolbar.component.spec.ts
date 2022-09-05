/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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
import { MetadataProcessToolbarComponent } from './metadata-process-toolbar.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import {
  Confirmation,
  ConfirmationService
} from '@tragically-slick/confirmation';
import { startMetadataUpdateProcess } from '@app/comic-metadata/actions/metadata.actions';
import {
  initialState as initialUserState,
  USER_FEATURE_KEY
} from '@app/user/reducers/user.reducer';
import { USER_ADMIN } from '@app/user/user.fixtures';
import { SKIP_CACHE_PREFERENCE } from '@app/library/library.constants';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { saveUserPreference } from '@app/user/actions/user.actions';

describe('MetadataProcessToolbarComponent', () => {
  const USER = USER_ADMIN;
  const SKIP_CACHE = Math.random() > 0.5;
  const initialState = {
    [USER_FEATURE_KEY]: { ...initialUserState, user: { ...USER } }
  };
  const IDS = [3, 20, 96, 9, 21, 98, 4, 17, 6];

  let component: MetadataProcessToolbarComponent;
  let fixture: ComponentFixture<MetadataProcessToolbarComponent>;
  let store: MockStore<any>;
  let confirmationService: ConfirmationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MetadataProcessToolbarComponent],
      imports: [
        NoopAnimationsModule,
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatDialogModule,
        MatTooltipModule,
        MatToolbarModule,
        MatIconModule
      ],
      providers: [provideMockStore({ initialState }), ConfirmationService]
    }).compileComponents();

    fixture = TestBed.createComponent(MetadataProcessToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    confirmationService = TestBed.inject(ConfirmationService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('setting the skip cache flag', () => {
    describe('if defined', () => {
      beforeEach(() => {
        component.skipCache = !SKIP_CACHE;
        store.setState({
          ...initialState,
          [USER_FEATURE_KEY]: {
            ...initialUserState,
            user: {
              ...USER,
              preferences: [
                {
                  name: SKIP_CACHE_PREFERENCE,
                  value: `${SKIP_CACHE}`
                }
              ]
            }
          }
        });
      });

      it('sets the flag from user preferences', () => {
        expect(component.skipCache).toEqual(SKIP_CACHE);
      });
    });

    describe('if not defined', () => {
      beforeEach(() => {
        component.skipCache = SKIP_CACHE;
        store.setState({
          ...initialState,
          [USER_FEATURE_KEY]: {
            ...initialUserState,
            user: {
              ...USER,
              preferences: null
            }
          }
        });
      });

      it('turns the flag off', () => {
        expect(component.skipCache).toEqual(false);
      });
    });
  });

  describe('starting the metadata update process', () => {
    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.selectedIds = IDS;
      component.skipCache = SKIP_CACHE;
      component.onStartBatchProcess();
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        startMetadataUpdateProcess({ ids: IDS, skipCache: SKIP_CACHE })
      );
    });
  });

  describe('toggling the skip cache preference', () => {
    beforeEach(() => {
      component.skipCache = SKIP_CACHE;
      component.onToggleSkipCache();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        saveUserPreference({
          name: SKIP_CACHE_PREFERENCE,
          value: `${!SKIP_CACHE}`
        })
      );
    });
  });
});
