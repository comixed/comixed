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
import { ReadingListPageComponent } from './reading-list-page.component';
import { LoggerModule } from '@angular-ru/logger';
import { TranslateModule } from '@ngx-translate/core';
import {
  initialState as initialReadingListDetailsState,
  READING_LIST_DETAIL_FEATURE_KEY
} from '@app/lists/reducers/reading-list-detail.reducer';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import {
  createReadingList,
  loadReadingList,
  saveReadingList
} from '@app/lists/actions/reading-list-detail.actions';
import { READING_LIST_3 } from '@app/lists/lists.fixtures';
import { ConfirmationService } from '@app/core/services/confirmation.service';
import { Confirmation } from '@app/core/models/confirmation';
import { ComicListViewComponent } from '@app/library/components/comic-list-view/comic-list-view.component';
import { COMIC_1, COMIC_3, COMIC_5 } from '@app/comic-book/comic-book.fixtures';
import { removeComicsFromReadingList } from '@app/lists/actions/reading-list-entries.actions';

describe('ReadingListPageComponent', () => {
  const READING_LIST = READING_LIST_3;
  const COMICS = [COMIC_1, COMIC_3, COMIC_5];
  const initialState = {
    [READING_LIST_DETAIL_FEATURE_KEY]: initialReadingListDetailsState
  };

  let component: ReadingListPageComponent;
  let fixture: ComponentFixture<ReadingListPageComponent>;
  let store: MockStore<any>;
  let activatedRoute: ActivatedRoute;
  let router: Router;
  let confirmationService: ConfirmationService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ReadingListPageComponent, ComicListViewComponent],
      imports: [
        RouterTestingModule.withRoutes([{ path: '**', redirectTo: '' }]),
        FormsModule,
        ReactiveFormsModule,
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatDialogModule,
        MatToolbarModule,
        MatIconModule,
        MatTooltipModule
      ],
      providers: [
        provideMockStore({ initialState }),
        {
          provide: ActivatedRoute,
          useValue: {
            params: new BehaviorSubject<{}>({})
          }
        },
        ConfirmationService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReadingListPageComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    activatedRoute = TestBed.inject(ActivatedRoute);
    router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl');
    spyOn(router, 'navigate');
    confirmationService = TestBed.inject(ConfirmationService);
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when creating a new reading list', () => {
    beforeEach(() => {
      component.readingListId = 1;
      (activatedRoute.params as BehaviorSubject<{}>).next({});
    });

    it('sets the reading list id', () => {
      expect(component.readingListId).toEqual(-1);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(createReadingList());
    });
  });

  describe('when loading an existing reading list', () => {
    beforeEach(() => {
      component.readingListId = -1;
      (activatedRoute.params as BehaviorSubject<{}>).next({
        id: `${READING_LIST.id}`
      });
    });

    it('sets the reading list id', () => {
      expect(component.readingListId).toEqual(READING_LIST.id);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        loadReadingList({ id: READING_LIST.id })
      );
    });
  });

  describe('when the reading list was not found', () => {
    beforeEach(() => {
      store.setState({
        ...initialState,
        [READING_LIST_DETAIL_FEATURE_KEY]: {
          ...initialReadingListDetailsState,
          notFound: true
        }
      });
    });

    it('redirects the browser', () => {
      expect(router.navigateByUrl).toHaveBeenCalledWith('/lists/reading');
    });
  });

  describe('receiving the reading list', () => {
    describe('after saving a new reading list', () => {
      beforeEach(() => {
        component.readingListId = -1;
        store.setState({
          ...initialState,
          [READING_LIST_DETAIL_FEATURE_KEY]: {
            ...initialReadingListDetailsState,
            notFound: false,
            list: READING_LIST
          }
        });
      });

      it('redirects the browser', () => {
        expect(router.navigate).toHaveBeenCalledWith([
          '/lists',
          'reading',
          READING_LIST.id
        ]);
      });
    });

    describe('when loading an existing reading list', () => {
      beforeEach(() => {
        component.readingListId = READING_LIST.id;
        store.setState({
          ...initialState,
          [READING_LIST_DETAIL_FEATURE_KEY]: {
            ...initialReadingListDetailsState,
            notFound: false,
            list: READING_LIST
          }
        });
      });

      it('sets the reading list', () => {
        expect(component.readingList).toEqual(READING_LIST);
      });

      it('loads the name', () => {
        expect(component.readingListForm.controls.name.value).toEqual(
          READING_LIST.name
        );
      });

      it('loads the summary', () => {
        expect(component.readingListForm.controls.summary.value).toEqual(
          READING_LIST.summary
        );
      });
    });
  });

  describe('saving a reading list', () => {
    beforeEach(() => {
      component.readingList = READING_LIST;
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.onSave();
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        saveReadingList({ list: READING_LIST })
      );
    });
  });

  describe('undoing changes to a reading list', () => {
    beforeEach(() => {
      component.readingList = READING_LIST;
      component.readingListForm.controls.name.setValue(
        READING_LIST.name.substr(1)
      );
      component.readingListForm.controls.summary.setValue(
        READING_LIST.summary.substr(1)
      );
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.onReset();
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('resets the name field', () => {
      expect(component.readingListForm.controls.name.value).toEqual(
        READING_LIST.name
      );
    });

    it('resets the summary field', () => {
      expect(component.readingListForm.controls.summary.value).toEqual(
        READING_LIST.summary
      );
    });
  });

  describe('setting selected entries', () => {
    beforeEach(() => {
      component.onSelectionChanged(COMICS);
    });

    it('stores the selection', () => {
      expect(component.selectedEntries).toEqual(COMICS);
    });
  });

  describe('removing selected entries', () => {
    beforeEach(() => {
      component.readingList = READING_LIST;
      component.selectedEntries = COMICS;
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.onRemoveEntries();
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        removeComicsFromReadingList({
          list: READING_LIST,
          comics: COMICS
        })
      );
    });
  });
});
