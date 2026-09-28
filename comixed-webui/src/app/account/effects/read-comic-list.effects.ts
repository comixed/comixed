/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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

import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ReadComicListActions } from '../actions/read-comic-list.actions';
import { LoggerService } from '@angular-ru/cdk/logger';
import { ReadComicService } from '@app/account/services/read-comic-service';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { AlertService } from '@app/services/alert-service';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class ReadComicListEffects {
  readonly actions$ = inject(Actions);
  readonly logger = inject(LoggerService);
  readonly readComicService = inject(ReadComicService);
  readonly alertService = inject(AlertService);
  readonly translateService = inject(TranslateService);

  markSelectedComics$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ReadComicListActions.markSelectedComics),
      tap(action =>
        this.logger.debug('Setting the read state for selected comics:', action)
      ),
      switchMap(action =>
        this.readComicService
          .markSelectedComics({
            readState: action.readState
          })
          .pipe(
            tap(() => this.logger.debug('Success')),
            map(() => ReadComicListActions.markSelectedComicsSuccess()),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'read-comic-list-effects.mark-selected-comics.service-failure'
                )
              );
              return of(ReadComicListActions.markSelectedComicsFailure());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.effects.general-failure')
        );
        return of(ReadComicListActions.markSelectedComicsFailure());
      })
    );
  });
}
