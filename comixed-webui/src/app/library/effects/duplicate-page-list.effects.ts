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

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  loadDuplicatePageList,
  loadDuplicatePageListFailure,
  loadDuplicatePageListSuccess
} from '@app/library/actions/duplicate-page-list.actions';
import { DuplicatePageService } from '@app/library/services/duplicate-page.service';
import { LoggerService } from '@angular-ru/cdk/logger';
import { AlertService } from '@app/core/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { LoadDuplicatePageListResponse } from '@app/library/models/net/load-duplicate-page-list-response';

@Injectable()
export class DuplicatePageListEffects {
  loadComicsWithDuplicatePages$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadDuplicatePageList),
      tap(action =>
        this.logger.trace(
          'Effect: loading all comics with duplicate pages:',
          action
        )
      ),
      switchMap(action =>
        this.duplicatePageService
          .loadDuplicatePages({
            page: action.page,
            size: action.size,
            sortBy: action.sortBy,
            sortDirection: action.sortDirection
          })
          .pipe(
            tap(response => this.logger.trace('Response received:', response)),
            map((response: LoadDuplicatePageListResponse) =>
              loadDuplicatePageListSuccess({
                pages: response.pages,
                totalPages: response.total
              })
            ),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'duplicate-pages.load-comics.effect-failure'
                )
              );
              return of(loadDuplicatePageListFailure());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(loadDuplicatePageListFailure());
      })
    );
  });

  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private duplicatePageService: DuplicatePageService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}
}
