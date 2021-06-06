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
import { BlockedPageDetailPageComponent } from './blocked-page-detail-page.component';
import { LoggerModule } from '@angular-ru/logger';
import {
  BLOCKED_PAGE_DETAIL_FEATURE_KEY,
  initialState as initialBlockedPageDetailState
} from '@app/blocked-pages/reducers/blocked-page-detail.reducer';
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
  BLOCKED_PAGE_1,
  BLOCKED_PAGE_3,
  BLOCKED_PAGE_4,
  BLOCKED_PAGE_5
} from '@app/blocked-pages/blocked-pages.fixtures';
import { Router } from '@angular/router';
import { Confirmation } from '@app/core/models/confirmation';
import { saveBlockedPage } from '@app/blocked-pages/actions/blocked-page-detail.actions';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TragicallySlickEditInPlaceModule } from '@tragically-slick/edit-in-place';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ConfirmationService } from '@app/core/services/confirmation.service';

describe('BlockedPageDetailPageComponent', () => {
  const ENTRIES = [BLOCKED_PAGE_1, BLOCKED_PAGE_3, BLOCKED_PAGE_5];
  const ENTRY = BLOCKED_PAGE_4;
  const initialState = {
    [BLOCKED_PAGE_DETAIL_FEATURE_KEY]: {
      ...initialBlockedPageDetailState,
      entry: ENTRY
    },
    [USER_FEATURE_KEY]: initialUserState
  };

  let component: BlockedPageDetailPageComponent;
  let fixture: ComponentFixture<BlockedPageDetailPageComponent>;
  let store: MockStore<any>;
  let router: Router;
  let confirmationService: ConfirmationService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BlockedPageDetailPageComponent],
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
        TragicallySlickEditInPlaceModule
      ],
      providers: [provideMockStore({ initialState }), ConfirmationService]
    }).compileComponents();

    fixture = TestBed.createComponent(BlockedPageDetailPageComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl');
    confirmationService = TestBed.inject(ConfirmationService);
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when the blocked page is not found', () => {
    beforeEach(() => {
      store.setState({
        ...initialState,
        [BLOCKED_PAGE_DETAIL_FEATURE_KEY]: {
          ...initialBlockedPageDetailState,
          loading: false,
          notFound: true
        }
      });
    });

    it('redirects to the blocked page list', () => {
      expect(router.navigateByUrl).toHaveBeenCalledWith('/admin/pages/blocked');
    });
  });

  describe('when the blocked page is loaded', () => {
    beforeEach(() => {
      component.editing = true;
      component.blockedPage = ENTRY;
    });

    it('loads the form', () => {
      expect(component.blockedPageForm.controls.label.value).toEqual(
        ENTRY.label
      );
    });

    it('clears the editing flag', () => {
      expect(component.editing).toBeFalse();
    });

    describe('when the page label is null', () => {
      beforeEach(() => {
        component.editing = true;
        store.setState({
          ...initialState,
          [BLOCKED_PAGE_DETAIL_FEATURE_KEY]: {
            ...initialBlockedPageDetailState,
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

  describe('editing the blocked page', () => {
    beforeEach(() => {
      component.editing = false;
      component.onEdit();
    });

    it('sets the editing flag', () => {
      expect(component.editing).toBeTrue();
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
        saveBlockedPage({ entry: component.encodeForm() })
      );
    });
  });

  describe('resetting the form', () => {
    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.blockedPage = ENTRY;
      component.editing = true;
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

    it('clears the editing flag', () => {
      expect(component.editing).toBeFalse();
    });
  });

  describe('leaving the detail page', () => {
    beforeEach(() => {
      component.onGoBack();
    });

    it('redirects the browsers', () => {
      expect(router.navigateByUrl).toHaveBeenCalledWith('/admin/pages/blocked');
    });
  });
});
