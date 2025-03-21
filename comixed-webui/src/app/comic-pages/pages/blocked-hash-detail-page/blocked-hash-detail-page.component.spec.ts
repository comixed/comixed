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
import { BlockedHashDetailPageComponent } from './blocked-hash-detail-page.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
import {
  initialState as initialUserState,
  USER_FEATURE_KEY
} from '@app/user/reducers/user.reducer';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialogModule } from '@angular/material/dialog';
import {
  BLOCKED_HASH_1,
  BLOCKED_HASH_3,
  BLOCKED_HASH_4,
  BLOCKED_HASH_5
} from '@app/comic-pages/comic-pages.fixtures';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  Confirmation,
  ConfirmationService
} from '@tragically-slick/confirmation';
import { MatIconModule } from '@angular/material/icon';
import { BlockedHashThumbnailUrlPipe } from '@app/comic-pages/pipes/blocked-hash-thumbnail-url.pipe';
import { saveBlockedHash } from '@app/comic-pages/actions/blocked-hashes.actions';
import {
  BLOCKED_HASHES_FEATURE_KEY,
  initialState as initialBlockedHashesState
} from '@app/comic-pages/reducers/blocked-hashes.reducer';

describe('BlockedHashDetailPageComponent', () => {
  const ENTRIES = [BLOCKED_HASH_1, BLOCKED_HASH_3, BLOCKED_HASH_5];
  const ENTRY = BLOCKED_HASH_4;
  const initialState = {
    [BLOCKED_HASHES_FEATURE_KEY]: {
      ...initialBlockedHashesState,
      entry: ENTRY
    },
    [USER_FEATURE_KEY]: initialUserState
  };

  let component: BlockedHashDetailPageComponent;
  let fixture: ComponentFixture<BlockedHashDetailPageComponent>;
  let store: MockStore<any>;
  let router: Router;
  let confirmationService: ConfirmationService;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [
          BlockedHashDetailPageComponent,
          BlockedHashThumbnailUrlPipe
        ],
        imports: [
          NoopAnimationsModule,
          RouterTestingModule.withRoutes([{ path: '**', redirectTo: '' }]),
          FormsModule,
          ReactiveFormsModule,
          LoggerModule.forRoot(),
          TranslateModule.forRoot(),
          MatDialogModule,
          MatCardModule,
          MatFormFieldModule,
          MatInputModule,
          MatIconModule
        ],
        providers: [provideMockStore({ initialState }), ConfirmationService]
      }).compileComponents();

      fixture = TestBed.createComponent(BlockedHashDetailPageComponent);
      component = fixture.componentInstance;
      store = TestBed.inject(MockStore);
      spyOn(store, 'dispatch');
      router = TestBed.inject(Router);
      spyOn(router, 'navigateByUrl');
      confirmationService = TestBed.inject(ConfirmationService);
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when the blocked page is not found', () => {
    beforeEach(() => {
      store.setState({
        ...initialState,
        [BLOCKED_HASHES_FEATURE_KEY]: {
          ...initialBlockedHashesState,
          loading: false,
          notFound: true
        }
      });
    });

    it('redirects to the blocked page list', () => {
      expect(router.navigateByUrl).toHaveBeenCalledWith(
        '/library/pages/blocked'
      );
    });
  });

  describe('when the blocked page is loaded', () => {
    beforeEach(() => {
      component.blockedPage = ENTRY;
    });

    it('loads the form', () => {
      expect(component.blockedPageForm.controls.label.value).toEqual(
        ENTRY.label
      );
    });

    describe('when the page label is null', () => {
      beforeEach(() => {
        store.setState({
          ...initialState,
          [BLOCKED_HASHES_FEATURE_KEY]: {
            ...initialBlockedHashesState,
            loading: false,
            notFound: false,
            entry: { ...ENTRY, label: null }
          }
        });
      });

      it('uses an empty string for the label', () => {
        expect(component.blockedPageForm.controls.label.value).toEqual('');
      });
    });
  });

  describe('saving the blocked page', () => {
    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.blockedPage = ENTRY;
      component.onSave();
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        saveBlockedHash({ entry: component.encodeForm() })
      );
    });
  });

  describe('resetting the form', () => {
    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.blockedPage = ENTRY;
      component.blockedPageForm.controls.label.setValue(ENTRY.label.substr(1));
      component.onReset();
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('resets the form', () => {
      expect(component.blockedPageForm.controls.label.value).toEqual(
        ENTRY.label
      );
    });
  });

  describe('leaving the detail page', () => {
    beforeEach(() => {
      component.onGoBack();
    });

    it('redirects the browsers', () => {
      expect(router.navigateByUrl).toHaveBeenCalledWith(
        '/library/pages/blocked'
      );
    });
  });
});
