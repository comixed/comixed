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
import { EditMultipleComicsComponent } from './edit-multiple-comics.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';
import {
  COMIC_BOOK_1,
  COMIC_BOOK_3,
  COMIC_BOOK_5,
  IMPRINT_1,
  IMPRINT_2,
  IMPRINT_3
} from '@app/comic-books/comic-books.fixtures';
import { TranslateModule } from '@ngx-translate/core';
import {
  IMPRINT_LIST_FEATURE_KEY,
  initialState as initialImprintListState
} from '@app/comic-books/reducers/imprint-list.reducer';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('EditMultipleComicsComponent', () => {
  const COMICS = [
    COMIC_BOOK_1,
    { ...COMIC_BOOK_3, publisher: COMIC_BOOK_1.publisher },
    { ...COMIC_BOOK_5, publisher: COMIC_BOOK_1.publisher }
  ];
  const IMPRINTS = [IMPRINT_1, IMPRINT_2, IMPRINT_3];
  const initialState = {
    [IMPRINT_LIST_FEATURE_KEY]: {
      ...initialImprintListState,
      entries: IMPRINTS
    }
  };

  let component: EditMultipleComicsComponent;
  let fixture: ComponentFixture<EditMultipleComicsComponent>;
  let store: MockStore<any>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditMultipleComicsComponent],
      imports: [
        NoopAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatFormFieldModule,
        MatButtonModule,
        MatSelectModule,
        MatDialogModule,
        MatIconModule,
        MatInputModule
      ],
      providers: [
        provideMockStore({ initialState }),
        {
          provide: MatDialogRef,
          useValue: {}
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: COMICS
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EditMultipleComicsComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('selecting an imprint', () => {
    const IMPRINT = IMPRINTS[1];

    beforeEach(() => {
      component.detailsForm.controls.publisher.setValue('');
      component.detailsForm.controls.imprint.setValue('');
      component.onImprintSelected(IMPRINT.name);
    });

    it('sets the publisher', () => {
      expect(component.detailsForm.controls.publisher.value).toEqual(
        IMPRINT.publisher
      );
    });

    it('sets the imprint', () => {
      expect(component.detailsForm.controls.imprint.value).toEqual(
        IMPRINT.name
      );
    });
  });
});
