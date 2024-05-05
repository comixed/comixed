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
  initialState as initialLastReadState,
  LAST_READ_LIST_FEATURE_KEY
} from '@app/comic-books/reducers/last-read-list.reducer';
import {
  initialState as initialLibraryState,
  LIBRARY_FEATURE_KEY
} from '@app/library/reducers/library.reducer';
import {
  COMIC_BOOK_SELECTION_FEATURE_KEY,
  initialState as initialComicBookSelectionState
} from '@app/comic-books/reducers/comic-book-selection.reducer';
import {
  BATCH_PROCESSES_FEATURE_KEY,
  initialState as initialBatchProcessesState
} from '@app/admin/reducers/batch-processes.reducer';
import { USER_ADMIN } from '@app/user/user.fixtures';
import {
  BATCH_PROCESS_DETAIL_1,
  BATCH_PROCESS_DETAIL_2
} from '@app/admin/admin.fixtures';

describe('FooterComponent', () => {
  const USER = USER_ADMIN;
  const initialState = {
    [LIBRARY_FEATURE_KEY]: initialLibraryState,
    [COMIC_BOOK_SELECTION_FEATURE_KEY]: initialComicBookSelectionState,
    [LAST_READ_LIST_FEATURE_KEY]: initialLastReadState,
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
  const readSubscription = jasmine.createSpyObj(['unsubscribe']);
  const selectionsSubscription = jasmine.createSpyObj(['unsubscribe']);
  const jobsSubscription = jasmine.createSpyObj(['unsubscribe']);

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [FooterComponent],
        imports: [LoggerModule.forRoot()],
        providers: [provideMockStore({ initialState })]
      }).compileComponents();

      fixture = TestBed.createComponent(FooterComponent);
      component = fixture.componentInstance;
      store = TestBed.inject(MockStore);
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when no user is logged in', () => {
    beforeEach(() => {
      component.stateSubscription = stateSubscription;
      component.readSubscription = readSubscription;
      component.selectionsSubscription = selectionsSubscription;
      component.jobsSubscription = jobsSubscription;
      component.user = null;
    });

    it('unsubscribes from library state updates', () => {
      expect(stateSubscription.unsubscribe).toHaveBeenCalled();
    });

    it('unsubscribes from comics read updates', () => {
      expect(readSubscription.unsubscribe).toHaveBeenCalled();
    });

    it('unsubscribes from selection updates', () => {
      expect(selectionsSubscription.unsubscribe).toHaveBeenCalled();
    });

    it('unsubscribes from jobs updates', () => {
      expect(jobsSubscription.unsubscribe).toHaveBeenCalled();
    });
  });

  describe('when a user is logged in', () => {
    beforeEach(() => {
      component.stateSubscription = null;
      component.readSubscription = null;
      component.selectionsSubscription = null;
      component.jobsSubscription = null;
      component.user = USER;
    });

    it('subscribes to library state updates', () => {
      expect(component.stateSubscription).not.toBeNull();
    });

    it('subscribes to comics read updates', () => {
      expect(component.readSubscription).not.toBeNull();
    });

    it('subscribes to selection updates', () => {
      expect(component.selectionsSubscription).not.toBeNull();
    });

    it('subscribes to jobs updates', () => {
      expect(component.jobsSubscription).not.toBeNull();
    });
  });
});
