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

import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';
import { DuplicatePagesEffects } from './duplicate-pages.effects';
import { DuplicatePagesService } from 'app/library/services/duplicate-pages.service';
import { MessageService } from 'primeng/api';
import { TranslateModule } from '@ngx-translate/core';
import { StoreModule } from '@ngrx/store';
import {
  DUPLICATE_PAGES_FEATURE_KEY,
  reducer
} from 'app/library/reducers/duplicate-pages.reducer';
import { EffectsModule } from '@ngrx/effects';
import { DUPLICATE_PAGE_1 } from 'app/library/library.fixtures';
import {
  DuplicatePagesAllReceived,
  DuplicatePagesGetAll,
  DuplicatePagesGetAllFailed
} from 'app/library/actions/duplicate-pages.actions';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse } from '@angular/common/http';
import objectContaining = jasmine.objectContaining;

describe('DuplicatePagesEffects', () => {
  const DUPLICATE_PAGES = [DUPLICATE_PAGE_1];

  let actions$: Observable<any>;
  let effects: DuplicatePagesEffects;
  let duplicatePagesService: jasmine.SpyObj<DuplicatePagesService>;
  let messageService: MessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        StoreModule.forRoot({}),
        StoreModule.forFeature(DUPLICATE_PAGES_FEATURE_KEY, reducer),
        EffectsModule.forRoot([]),
        EffectsModule.forFeature([DuplicatePagesEffects])
      ],
      providers: [
        DuplicatePagesEffects,
        provideMockActions(() => actions$),
        {
          provide: DuplicatePagesService,
          useValue: {
            getAll: jasmine.createSpy('DuplicatePagesService.getAll()')
          }
        },
        MessageService
      ]
    });

    effects = TestBed.get(DuplicatePagesEffects);
    duplicatePagesService = TestBed.get(DuplicatePagesService);
    messageService = TestBed.get(MessageService);
    spyOn(messageService, 'add');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('getting all duplicate pages', () => {
    it('fires an action on success', () => {
      const serviceResponse = DUPLICATE_PAGES;
      const action = new DuplicatePagesGetAll();
      const outcome = new DuplicatePagesAllReceived({ pages: serviceResponse });

      actions$ = hot('-a', { a: action });
      duplicatePagesService.getAll.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.getAll$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = new DuplicatePagesGetAll();
      const outcome = new DuplicatePagesGetAllFailed();

      actions$ = hot('-a', { a: action });
      duplicatePagesService.getAll.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.getAll$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });

    it('fires an action on general failure', () => {
      const action = new DuplicatePagesGetAll();
      const outcome = new DuplicatePagesGetAllFailed();

      actions$ = hot('-a', { a: action });
      duplicatePagesService.getAll.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.getAll$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });
  });
});
