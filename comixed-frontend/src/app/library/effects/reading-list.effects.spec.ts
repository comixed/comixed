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
 * along with this program. If not, see <http:/www.gnu.org/licenses/>.package
 * org.comixed;
 */

import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';

import { ReadingListEffects } from './reading-list.effects';
import { ReadingListService } from 'app/library/services/reading-list.service';
import { READING_LIST_1 } from 'app/library/models/reading-list/reading-list.fixtures';
import {
  ReadingListGet,
  ReadingListGetFailed,
  ReadingListLoadFailed,
  ReadingListReceived,
  ReadingListSave,
  ReadingListSaved,
  ReadingListSaveFailed,
  ReadingListsLoad,
  ReadingListsLoaded
} from 'app/library/actions/reading-list.actions';
import { hot } from 'jasmine-marbles';
import { MessageService } from 'primeng/api';
import { TranslateModule } from '@ngx-translate/core';
import arrayContaining = jasmine.arrayContaining;
import objectContaining = jasmine.objectContaining;
import { HttpErrorResponse } from '@angular/common/http';

describe('ReadingListEffects', () => {
  const READING_LISTS = [READING_LIST_1];

  let actions$: Observable<any>;
  let effects: ReadingListEffects;
  let reading_list_service: jasmine.SpyObj<ReadingListService>;
  let message_service: MessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        ReadingListEffects,
        provideMockActions(() => actions$),
        {
          provide: ReadingListService,
          useValue: {
            get_all: jasmine.createSpy('ReadingListService.get_all'),
            get_reading_list: jasmine.createSpy(
              'ReadingListService.get_reading_list'
            ),
            save_reading_list: jasmine.createSpy(
              'ReadingListService.saveReadingList'
            )
          }
        },
        MessageService
      ]
    });

    effects = TestBed.get(ReadingListEffects);
    reading_list_service = TestBed.get(ReadingListService);
    message_service = TestBed.get(MessageService);
    spyOn(message_service, 'add');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('when getting all reading lists', () => {
    it('fires an action on success', () => {
      const service_response = READING_LISTS;
      const action = new ReadingListsLoad();
      const outcome = new ReadingListsLoaded({ reading_lists: READING_LISTS });

      actions$ = hot('-a', { a: action });
      reading_list_service.get_all.and.returnValue(of(service_response));

      const expected = hot('-b', { b: outcome });
      expect(effects.get_all$).toBeObservable(expected);
      expect(message_service.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'info' })
      );
    });

    it('fires an action on service failure', () => {
      const service_response = new HttpErrorResponse({});
      const action = new ReadingListsLoad();
      const outcome = new ReadingListLoadFailed();

      actions$ = hot('-a', { a: action });
      reading_list_service.get_all.and.returnValue(
        throwError(service_response)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.get_all$).toBeObservable(expected);
      expect(message_service.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });

    it('fires an action on general failure', () => {
      const action = new ReadingListsLoad();
      const outcome = new ReadingListLoadFailed();

      actions$ = hot('-a', { a: action });
      reading_list_service.get_all.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.get_all$).toBeObservable(expected);
      expect(message_service.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });
  });

  describe('when getting a single reading list', () => {
    it('fires an action on success', () => {
      const service_response = READING_LIST_1;
      const action = new ReadingListGet({ id: READING_LIST_1.id });
      const outcome = new ReadingListReceived({ reading_list: READING_LIST_1 });

      actions$ = hot('-a', { a: action });
      reading_list_service.get_reading_list.and.returnValue(
        of(service_response)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.get_reading_list$).toBeObservable(expected);
      expect(message_service.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'info' })
      );
    });

    it('fires an action on service failure', () => {
      const service_response = new HttpErrorResponse({});
      const action = new ReadingListGet({ id: READING_LIST_1.id });
      const outcome = new ReadingListGetFailed();

      actions$ = hot('-a', { a: action });
      reading_list_service.get_reading_list.and.returnValue(
        throwError(service_response)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.get_reading_list$).toBeObservable(expected);
      expect(message_service.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });

    it('fires an action on general failure', () => {
      const action = new ReadingListGet({ id: READING_LIST_1.id });
      const outcome = new ReadingListGetFailed();

      actions$ = hot('-a', { a: action });
      reading_list_service.get_reading_list.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.get_reading_list$).toBeObservable(expected);
      expect(message_service.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });
  });

  describe('when saving a reading list', () => {
    it('fires an action on success', () => {
      const service_response = READING_LIST_1;
      const action = new ReadingListSave({ reading_list: READING_LIST_1 });
      const outcome = new ReadingListSaved({ reading_list: READING_LIST_1 });

      actions$ = hot('-a', { a: action });
      reading_list_service.save_reading_list.and.returnValue(
        of(service_response)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.save_reading_list$).toBeObservable(expected);
      expect(message_service.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'info' })
      );
    });

    it('fires an action on service failure', () => {
      const service_response = new HttpErrorResponse({});
      const action = new ReadingListSave({ reading_list: READING_LIST_1 });
      const outcome = new ReadingListSaveFailed();

      actions$ = hot('-a', { a: action });
      reading_list_service.save_reading_list.and.returnValue(
        throwError(service_response)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.save_reading_list$).toBeObservable(expected);
      expect(message_service.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });

    it('fires an action on general failure', () => {
      const action = new ReadingListSave({ reading_list: READING_LIST_1 });
      const outcome = new ReadingListSaveFailed();

      actions$ = hot('-a', { a: action });
      reading_list_service.save_reading_list.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.save_reading_list$).toBeObservable(expected);
      expect(message_service.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });
  });
});
