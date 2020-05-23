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
 * along with this program. If not, see <http:/www.gnu.org/licenses>
 */

import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { TranslateModule } from '@ngx-translate/core';
import {
  ReadingListSave,
  ReadingListSaved,
  ReadingListSaveFailed
} from 'app/library/actions/reading-list.actions';
import { ReadingListService } from 'app/library/services/reading-list.service';
import { hot } from 'jasmine-marbles';
import { LoggerModule } from '@angular-ru/logger';
import { MessageService } from 'primeng/api';
import { Observable, of, throwError } from 'rxjs';

import { ReadingListEffects } from './reading-list.effects';
import { READING_LIST_1 } from 'app/comics/models/reading-list.fixtures';
import objectContaining = jasmine.objectContaining;

describe('ReadingListEffects', () => {
  const READING_LIST = READING_LIST_1;
  const READING_LIST_ID = READING_LIST.id;
  const READING_LIST_NAME = READING_LIST.name;
  const READING_LIST_SUMMARY = READING_LIST.summary;

  let actions$: Observable<any>;
  let effects: ReadingListEffects;
  let reading_list_service: jasmine.SpyObj<ReadingListService>;
  let message_service: MessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), LoggerModule.forRoot()],
      providers: [
        ReadingListEffects,
        provideMockActions(() => actions$),
        {
          provide: ReadingListService,
          useValue: {
            save: jasmine.createSpy('ReadingListService.save')
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

  describe('when saving a reading list', () => {
    it('fires an action on success', () => {
      const service_response = READING_LIST_1;
      const action = new ReadingListSave({
        id: READING_LIST_ID,
        name: READING_LIST_NAME,
        summary: READING_LIST_SUMMARY
      });
      const outcome = new ReadingListSaved({ readingList: READING_LIST });

      actions$ = hot('-a', { a: action });
      reading_list_service.save.and.returnValue(of(service_response));

      const expected = hot('-b', { b: outcome });
      expect(effects.save$).toBeObservable(expected);
      expect(message_service.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'info' })
      );
    });

    it('fires an action on service failure', () => {
      const service_response = new HttpErrorResponse({});
      const action = new ReadingListSave({
        id: READING_LIST_ID,
        name: READING_LIST_NAME,
        summary: READING_LIST_SUMMARY
      });
      const outcome = new ReadingListSaveFailed();

      actions$ = hot('-a', { a: action });
      reading_list_service.save.and.returnValue(throwError(service_response));

      const expected = hot('-b', { b: outcome });
      expect(effects.save$).toBeObservable(expected);
      expect(message_service.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });

    it('fires an action on general failure', () => {
      const action = new ReadingListSave({
        id: READING_LIST_ID,
        name: READING_LIST_NAME,
        summary: READING_LIST_SUMMARY
      });
      const outcome = new ReadingListSaveFailed();

      actions$ = hot('-a', { a: action });
      reading_list_service.save.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.save$).toBeObservable(expected);
      expect(message_service.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });
  });
});
