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
import { FooterComponent } from './footer.component';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { LoggerModule } from '@angular-ru/cdk/logger';
import {
  initialState as initialLibraryState,
  LIBRARY_FEATURE_KEY
} from '@app/library/reducers/library.reducer';
import {
  BATCH_PROCESSES_FEATURE_KEY,
  initialState as initialBatchProcessesState
} from '@app/admin/reducers/batch-processes.reducer';
import {
  READ_COMIC_BOOK_1,
  READ_COMIC_BOOK_2,
  READ_COMIC_BOOK_3,
  USER_ADMIN,
  USER_READER
} from '@app/user/user.fixtures';
import {
  BATCH_PROCESS_DETAIL_1,
  BATCH_PROCESS_DETAIL_2
} from '@app/admin/admin.fixtures';
import {
  COMIC_BOOK_SELECTION_FEATURE_KEY,
  initialState as initialComicBookSelectionState
} from '@app/comic-books/reducers/comic-book-selection.reducer';

describe('FooterComponent', () => {
  const USER = USER_ADMIN;
  const COMICS_READ_ENTRIES = [
    READ_COMIC_BOOK_1,
    READ_COMIC_BOOK_2,
    READ_COMIC_BOOK_3
  ];
  const initialState = {
    [LIBRARY_FEATURE_KEY]: initialLibraryState,
    [COMIC_BOOK_SELECTION_FEATURE_KEY]: initialComicBookSelectionState,
    [BATCH_PROCESSES_FEATURE_KEY]: {
      ...initialBatchProcessesState,
      entries: [
        BATCH_PROCESS_DETAIL_1,
        { ...BATCH_PROCESS_DETAIL_2, endTime: null }
      ]
    }
  };
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;
  let store: MockStore;
  const stateSubscription = jasmine.createSpyObj(['unsubscribe']);
  const selectionsSubscription = jasmine.createSpyObj(['unsubscribe']);
  const jobsSubscription = jasmine.createSpyObj(['unsubscribe']);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [LoggerModule.forRoot(), FooterComponent],
      providers: [provideMockStore({ initialState })]
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when no user is logged in', () => {
    beforeEach(() => {
      component.libraryStateSubscription = stateSubscription;
      component.selectionsSubscription = selectionsSubscription;
      component.jobsSubscription = jobsSubscription;
      component.readCount = 717;
      component.user = null;
    });

    it('unsubscribes from library state updates', () => {
      expect(stateSubscription.unsubscribe).toHaveBeenCalled();
    });

    it('unsubscribes from selection updates', () => {
      expect(selectionsSubscription.unsubscribe).toHaveBeenCalled();
    });

    it('unsubscribes from jobs updates', () => {
      expect(jobsSubscription.unsubscribe).toHaveBeenCalled();
    });

    it('clears the read count', () => {
      expect(component.readCount).toEqual(0);
    });
  });

  describe('when a user is logged in', () => {
    beforeEach(() => {
      component.libraryStateSubscription = null;
      component.selectionsSubscription = null;
      component.jobsSubscription = null;
      component.user = { ...USER, readComicBooks: COMICS_READ_ENTRIES };
    });

    it('subscribes to library state updates', () => {
      expect(component.libraryStateSubscription).not.toBeNull();
    });

    it('subscribes to selection updates', () => {
      expect(component.selectionsSubscription).not.toBeNull();
    });

    it('subscribes to jobs updates', () => {
      expect(component.jobsSubscription).not.toBeNull();
    });

    it('sets the read count', () => {
      expect(component.readCount).toEqual(COMICS_READ_ENTRIES.length);
    });
  });

  describe('the admin flag', () => {
    it('sets it to true for an admin', () => {
      component.user = USER_ADMIN;
      expect(component.isAdmin).toBeTrue();
    });

    it('sets it to false for a reader', () => {
      component.user = USER_READER;
      expect(component.isAdmin).toBeFalse();
    });
  });
});
