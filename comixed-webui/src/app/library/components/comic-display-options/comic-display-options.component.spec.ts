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
import { ComicDisplayOptionsComponent } from './comic-display-options.component';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { LoggerModule } from '@angular-ru/logger';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  initialState as initialUserState,
  USER_FEATURE_KEY
} from '@app/user/reducers/user.reducer';
import { MatSliderModule } from '@angular/material/slider';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  DISPLAY_FEATURE_KEY,
  initialState as initialDisplayState
} from '@app/library/reducers/display.reducer';
import {
  resetDisplayOptions,
  setPageSize
} from '@app/library/actions/display.actions';
import { saveUserPreference } from '@app/user/actions/user.actions';
import { PAGE_SIZE_PREFERENCE } from '@app/library/library.constants';
import { USER_READER } from '@app/user/user.fixtures';

describe('ComicDisplayOptionsComponent', () => {
  const USER = USER_READER;
  const PAGE_SIZE = 400;
  const initialState = {
    [USER_FEATURE_KEY]: { ...initialUserState, user: USER },
    [DISPLAY_FEATURE_KEY]: initialDisplayState
  };

  let component: ComicDisplayOptionsComponent;
  let fixture: ComponentFixture<ComicDisplayOptionsComponent>;
  let store: MockStore<any>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<any>>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ComicDisplayOptionsComponent],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatDialogModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatButtonModule,
        MatSliderModule,
        MatFormFieldModule
      ],
      providers: [
        provideMockStore({ initialState }),
        {
          provide: MatDialogRef,
          useValue: {
            close: jasmine.createSpy('MatDialogRef.close()')
          }
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {}
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicDisplayOptionsComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    dialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<
      MatDialogRef<any>
    >;
    spyOn(store, 'dispatch');
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('loading the form', () => {
    beforeEach(() => {
      component.comicDisplayForm.controls.pageSize.setValue(0);
      store.setState({
        ...initialState,
        [DISPLAY_FEATURE_KEY]: { ...initialDisplayState, pageSize: PAGE_SIZE }
      });
      fixture.detectChanges();
    });

    it('updates the page size form control', () => {
      expect(component.comicDisplayForm.controls.pageSize.value).toEqual(
        PAGE_SIZE
      );
    });

    describe('saving the changes made', () => {
      beforeEach(() => {
        component.onSaveChanges();
      });

      it('saves the page size preference', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          saveUserPreference({
            name: PAGE_SIZE_PREFERENCE,
            value: `${PAGE_SIZE}`
          })
        );
      });

      it('closes the dialog', () => {
        expect(dialogRef.close).toHaveBeenCalledWith(false);
      });
    });

    describe('canceling the changes made', () => {
      beforeEach(() => {
        component.onCancelChanges();
      });

      it('resets the user preferences', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          resetDisplayOptions({ user: USER })
        );
      });

      it('closes the dialog', () => {
        expect(dialogRef.close).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('changing the page size', () => {
    beforeEach(() => {
      component.onDisplaySizeChange(PAGE_SIZE);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        setPageSize({ size: PAGE_SIZE, save: false })
      );
    });
  });
});
