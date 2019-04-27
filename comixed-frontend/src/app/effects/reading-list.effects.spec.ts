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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import { ReadingListEffects } from './reading-list.effects';
import { Observable } from 'rxjs/Observable';
import { READING_LIST_1 } from 'app/models/reading-list.fixtures';
import * as ReadingListActions from 'app/actions/reading-list.actions';
import { cold, hot } from 'jasmine-marbles';
import { ReadingListService } from 'app/services/reading-list.service';
import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';

describe('ReadingListEffects', () => {
  let effects: ReadingListEffects;
  let reading_list_service: jasmine.SpyObj<ReadingListService>;
  let actions: Observable<any>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ReadingListEffects,
        provideMockActions(() => actions),
        {
          provide: ReadingListService,
          useValue: {
            save_reading_list: jasmine.createSpy(
              'ReadingListService.save_reading_list'
            ),
            get_reading_lists: jasmine.createSpy('ReadingListService.get_all')
          }
        }
      ]
    });

    effects = TestBed.get(ReadingListEffects);
    reading_list_service = TestBed.get(ReadingListService);
  });

  it('should create an instance', () => {
    expect(effects).toBeTruthy();
  });

  describe('when getting all reading lists', () => {
    const READING_LISTS = [READING_LIST_1];

    it('fires an action when the list is received', () => {
      const service_response = READING_LISTS;
      const action = new ReadingListActions.ReadingListGetAll();
      const outcome = new ReadingListActions.ReadingListGotList({
        reading_lists: READING_LISTS
      });

      actions = hot('-a', { a: action });
      const response = cold('-a|', { a: [service_response] });
      reading_list_service.get_reading_lists.and.returnValue([
        service_response
      ]);

      const expected = cold('-b', { b: outcome });
      expect(effects.reading_list_get_all$).toBeObservable(expected);
    });

    it('fires an error action when the fetch fails', () => {
      const action = new ReadingListActions.ReadingListGetAll();
      const outcome = new ReadingListActions.ReadingListGetFailed();

      actions = hot('-a', { a: action });
      const response = cold('-#|', {}, new Error('Expected'));
      reading_list_service.get_reading_lists.and.throwError('Expected');

      const expected = cold('-(b|)', { b: outcome });
      expect(effects.reading_list_get_all$).toBeObservable(expected);
    });
  });

  describe('when saving a reading list', () => {
    const READING_LIST = READING_LIST_1;

    it('fires a save action on success', () => {
      const service_response = READING_LIST;
      const action = new ReadingListActions.ReadingListSave({
        reading_list: READING_LIST
      });
      const outcome = new ReadingListActions.ReadingListSaved({
        reading_list: READING_LIST
      });

      actions = hot('-a', { a: action });
      const response = cold('-a|', { a: [service_response] });
      reading_list_service.save_reading_list.and.returnValue([
        service_response
      ]);

      const expected = cold('-b', { b: outcome });
      expect(effects.reading_list_save$).toBeObservable(expected);
    });

    it('fires a failure action on error', () => {
      const error = new Error('expected');
      const action = new ReadingListActions.ReadingListSave({
        reading_list: READING_LIST
      });
      const outcome = new ReadingListActions.ReadingListSaveFailed();

      actions = hot('-a', { a: action });
      const response = cold('-#|', {}, error);
      reading_list_service.save_reading_list.and.throwError('expected');

      const expected = cold('-(b|)', { b: outcome });
      expect(effects.reading_list_save$).toBeObservable(expected);
    });
  });
});
