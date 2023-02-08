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

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ComicOverviewComponent } from './comic-overview.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { ComicCoverUrlPipe } from '@app/comic-books/pipes/comic-cover-url.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { COMIC_BOOK_1 } from '@app/comic-books/comic-books.fixtures';
import { RouterTestingModule } from '@angular/router/testing';
import { ComicBookState } from '@app/comic-books/models/comic-book-state';
import { MatGridListModule } from '@angular/material/grid-list';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { MatDialogModule } from '@angular/material/dialog';
import {
  Confirmation,
  ConfirmationService
} from '@tragically-slick/confirmation';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatTooltipModule } from '@angular/material/tooltip';
import { updateComicBook } from '@app/comic-books/actions/comic-book.actions';

describe('ComicOverviewComponent', () => {
  const COMIC = COMIC_BOOK_1;
  const initialState = {};

  let component: ComicOverviewComponent;
  let fixture: ComponentFixture<ComicOverviewComponent>;
  let store: MockStore<any>;
  let confirmationService: ConfirmationService;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ComicOverviewComponent, ComicCoverUrlPipe],
        imports: [
          NoopAnimationsModule,
          FormsModule,
          ReactiveFormsModule,
          LoggerModule.forRoot(),
          TranslateModule.forRoot(),
          RouterTestingModule.withRoutes([
            {
              path: '*',
              redirectTo: ''
            }
          ]),
          MatGridListModule,
          MatDialogModule,
          MatToolbarModule,
          MatIconModule,
          MatDatepickerModule,
          MatInputModule,
          MatNativeDateModule,
          MatTooltipModule
        ],
        providers: [provideMockStore({ initialState }), ConfirmationService]
      }).compileComponents();

      fixture = TestBed.createComponent(ComicOverviewComponent);
      component = fixture.componentInstance;
      component.comicBook = COMIC;
      store = TestBed.inject(MockStore);
      spyOn(store, 'dispatch');
      confirmationService = TestBed.inject(ConfirmationService);
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('checking if a comic is changed', () => {
    describe('when ADDED', () => {
      beforeEach(() => {
        component.comicBook = {
          ...COMIC,
          detail: { ...COMIC.detail, comicState: ComicBookState.ADDED }
        };
      });

      it('sets it to false', () => {
        expect(component.comicChanged).toBeFalse();
      });

      it('is not marked as deleted', () => {
        expect(component.deleted).toBeFalse();
      });
    });

    describe('when CHANGED', () => {
      beforeEach(() => {
        component.comicBook = {
          ...COMIC,
          detail: { ...COMIC.detail, comicState: ComicBookState.CHANGED }
        };
      });

      it('sets it to true', () => {
        expect(component.comicChanged).toBeTrue();
      });

      it('is not marked as deleted', () => {
        expect(component.deleted).toBeFalse();
      });
    });

    describe('when STABLE', () => {
      beforeEach(() => {
        component.comicBook = {
          ...COMIC,
          detail: { ...COMIC.detail, comicState: ComicBookState.STABLE }
        };
      });

      it('sets it to false', () => {
        expect(component.comicChanged).toBeFalse();
      });

      it('is not marked as deleted', () => {
        expect(component.deleted).toBeFalse();
      });
    });

    describe('when DELETED', () => {
      beforeEach(() => {
        component.comicBook = {
          ...COMIC,
          detail: { ...COMIC.detail, comicState: ComicBookState.DELETED }
        };
      });

      it('sets it to false', () => {
        expect(component.comicChanged).toBeFalse();
      });

      it('is marked as deleted', () => {
        expect(component.deleted).toBeTrue();
      });
    });
  });

  describe('when the dates are null', () => {
    beforeEach(() => {
      component.comicBook = {
        ...COMIC,
        detail: { ...COMIC.detail, coverDate: null, storeDate: null }
      };
    });

    it('sets a null cover date value', () => {
      expect(component.comicBookForm.controls.coverDate.value).toBeNull();
    });

    it('sets a null store date value', () => {
      expect(component.comicBookForm.controls.storeDate.value).toBeNull();
    });
  });

  describe('saving changes', () => {
    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.onSaveChanges();
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        updateComicBook({ comicBook: component.comicBook })
      );
    });
  });

  describe('undoing changes', () => {
    beforeEach(() => {
      component.comicBookForm.controls.publisher.setValue(
        COMIC.detail.publisher.substr(1)
      );
      component.comicBookForm.controls.series.setValue(
        COMIC.detail.series.substr(1)
      );
      component.comicBookForm.controls.volume.setValue(
        COMIC.detail.volume.substr(1)
      );
      component.comicBookForm.controls.issueNumber.setValue(
        COMIC.detail.issueNumber.substr(1)
      );
      component.comicBookForm.controls.coverDate.setValue(null);
      component.comicBookForm.controls.storeDate.setValue(null);
      component.onUndoChanges();
    });

    it('resets the changes to the publisher', () => {
      expect(component.comicBookForm.controls.publisher.value).toEqual(
        COMIC.detail.publisher
      );
    });

    it('resets the changes to the series', () => {
      expect(component.comicBookForm.controls.series.value).toEqual(
        COMIC.detail.series
      );
    });

    it('resets the changes to the volume', () => {
      expect(component.comicBookForm.controls.volume.value).toEqual(
        COMIC.detail.volume
      );
    });

    it('resets the changes to the issue number', () => {
      expect(component.comicBookForm.controls.issueNumber.value).toEqual(
        COMIC.detail.issueNumber
      );
    });

    it('resets the changes to the cover date', () => {
      expect(component.comicBookForm.controls.coverDate.value).toEqual(
        new Date(COMIC.detail.coverDate)
      );
    });

    it('resets the changes to the store dater', () => {
      expect(component.comicBookForm.controls.storeDate.value).toEqual(
        new Date(COMIC.detail.storeDate)
      );
    });
  });
});
