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
import { SelectedComicListActions } from '../actions/selected-comic-list.actions';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { LoggerService } from '@angular-ru/cdk/logger';
import { ComicService } from '@app/library/services/comic-service';
import { AlertService } from '@app/services/alert-service';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class SelectedComicListEffects {
  readonly logger = inject(LoggerService);
  readonly comicService = inject(ComicService);
  readonly alertService = inject(AlertService);
  readonly translateService = inject(TranslateService);

  private actions$ = inject(Actions);
  load$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(SelectedComicListActions.load),
      tap(() => this.logger.debug('Loading select comic id list')),
      switchMap(() =>
        this.comicService.loadSelectComicIds().pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map(response =>
            SelectedComicListActions.loadSuccess({ comicIds: response })
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'selected-comic-list-effects.load.service-failure'
              )
            );
            return of(SelectedComicListActions.loadFailure());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.effects.general-failure')
        );
        return of(SelectedComicListActions.loadFailure());
      })
    );
  });

  selectComic$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(SelectedComicListActions.selectComic),
      tap(action => this.logger.debug('Selecting a single comic:', action)),
      switchMap(action =>
        this.comicService
          .singleComicSelection({
            comic: action.comic,
            selected: action.selected
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            map(() => SelectedComicListActions.selectComicSuccess()),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'selected-comic-list-effects.select-comic.service-failure'
                )
              );
              return of(SelectedComicListActions.selectComicFailure());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.effects.general-failure')
        );
        return of(SelectedComicListActions.selectComicFailure());
      })
    );
  });
}
