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

import { ComicsReadStatisticsEffects } from './comics-read-statistics.effects';
import {
  COMICS_READ_STATISTICS_1,
  COMICS_READ_STATISTICS_2,
  COMICS_READ_STATISTICS_3,
  COMICS_READ_STATISTICS_4,
  COMICS_READ_STATISTICS_5
} from '@app/app.fixtures';
import { UserService } from '@app/user/services/user.service';
import {
  loadComicsReadStatistics,
  loadComicsReadStatisticsFailure,
  loadComicsReadStatisticsSuccess
} from '@app/actions/comics-read-statistics.actions';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertService } from '@app/core/services/alert.service';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('ComicsReadStatisticsEffects', () => {
  const COMICS_READ_STATISTICS = [
    COMICS_READ_STATISTICS_1,
    COMICS_READ_STATISTICS_2,
    COMICS_READ_STATISTICS_3,
    COMICS_READ_STATISTICS_4,
    COMICS_READ_STATISTICS_5
  ];

  let actions$: Observable<any>;
  let effects: ComicsReadStatisticsEffects;
  let userService: jasmine.SpyObj<UserService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatSnackBarModule
      ],
      providers: [
        ComicsReadStatisticsEffects,
        provideMockActions(() => actions$),
        {
          provide: UserService,
          useValue: {
            loadComicsReadStatistics: jasmine.createSpy(
              'UserService.loadComicsReadStatistics()'
            )
          }
        },
        AlertService
      ]
    });

    effects = TestBed.inject(ComicsReadStatisticsEffects);
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading the comics read statistics', () => {
    it('fires an action on success', () => {
      const serviceResponse = COMICS_READ_STATISTICS;
      const action = loadComicsReadStatistics();
      const outcome = loadComicsReadStatisticsSuccess({
        data: COMICS_READ_STATISTICS
      });

      actions$ = hot('-a', { a: action });
      userService.loadComicsReadStatistics
        .withArgs()
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadComicsReadStatistics$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadComicsReadStatistics();
      const outcome = loadComicsReadStatisticsFailure();

      actions$ = hot('-a', { a: action });
      userService.loadComicsReadStatistics
        .withArgs()
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadComicsReadStatistics$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadComicsReadStatistics();
      const outcome = loadComicsReadStatisticsFailure();

      actions$ = hot('-a', { a: action });
      userService.loadComicsReadStatistics
        .withArgs()
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadComicsReadStatistics$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
