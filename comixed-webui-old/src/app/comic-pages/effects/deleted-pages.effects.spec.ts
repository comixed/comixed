/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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

import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';
import { DeletedPagesEffects } from './deleted-pages.effects';
import { DeletedPagesService } from '@app/comic-pages/services/deleted-pages.service';
import {
  DELETED_PAGE_1,
  DELETED_PAGE_2,
  DELETED_PAGE_3,
  DELETED_PAGE_4
} from '@app/comic-pages/comic-pages.fixtures';
import {
  deletedPagesLoaded,
  loadDeletedPages,
  loadDeletedPagesFailed
} from '@app/comic-pages/actions/deleted-pages.actions';
import { hot } from 'jasmine-marbles';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { AlertService } from '@app/core/services/alert.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('DeletedPagesEffects', () => {
  const DELETED_PAGE_LIST = [
    DELETED_PAGE_1,
    DELETED_PAGE_2,
    DELETED_PAGE_3,
    DELETED_PAGE_4
  ];

  let actions$: Observable<any>;
  let effects: DeletedPagesEffects;
  let deletedPagesService: jasmine.SpyObj<DeletedPagesService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatSnackBarModule
      ],
      providers: [
        DeletedPagesEffects,
        provideMockActions(() => actions$),
        {
          provide: DeletedPagesService,
          useValue: {
            loadAll: jasmine.createSpy('DeletedPagesService.loadAll()')
          }
        },
        AlertService
      ]
    });

    effects = TestBed.inject(DeletedPagesEffects);
    deletedPagesService = TestBed.inject(
      DeletedPagesService
    ) as jasmine.SpyObj<DeletedPagesService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading the list of deleted pages', () => {
    it('fires an action on success', () => {
      const serviceResponse = DELETED_PAGE_LIST;
      const action = loadDeletedPages();
      const outcome = deletedPagesLoaded({ pages: DELETED_PAGE_LIST });

      actions$ = hot('-a', { a: action });
      deletedPagesService.loadAll.and.returnValues(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadedDeletedPages$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadDeletedPages();
      const outcome = loadDeletedPagesFailed();

      actions$ = hot('-a', { a: action });
      deletedPagesService.loadAll.and.returnValues(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadedDeletedPages$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadDeletedPages();
      const outcome = loadDeletedPagesFailed();

      actions$ = hot('-a', { a: action });
      deletedPagesService.loadAll.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadedDeletedPages$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
