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
import { ComicRemovalActions } from '../actions/comic-removal.actions';
import { LoggerService } from '@angular-ru/cdk/logger';
import { ComicService } from '@app/library/services/comic-service';
import { AlertService } from '@app/services/alert-service';
import { TranslateService } from '@ngx-translate/core';
import { catchError, map, of, switchMap, tap } from 'rxjs';

@Injectable()
export class ComicRemovalEffects {
  readonly logger = inject(LoggerService);
  readonly comicService = inject(ComicService);
  readonly alertService = inject(AlertService);
  readonly translateService = inject(TranslateService);

  private actions$ = inject(Actions);

  markOneForRemoval$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ComicRemovalActions.markOneForRemoval),
      tap(action =>
        this.logger.debug('Marking one comic for removal:', action)
      ),
      switchMap(action =>
        this.comicService
          .singleComicRemoval({ comic: action.comic, removal: true })
          .pipe(
            tap(() =>
              this.alertService.info(
                this.translateService.instant(
                  'comic-removal-effects.mark-one-for-removal.service-success'
                )
              )
            ),
            map(() => ComicRemovalActions.markOneForRemovalSuccess()),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'comic-removal-effects.mark-one-for-removal.service-failure'
                )
              );
              return of(ComicRemovalActions.markOneForRemovalFailure());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.effects.general-failure')
        );
        return of(ComicRemovalActions.markOneForRemovalFailure());
      })
    );
  });

  unmarkOneForRemoval$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ComicRemovalActions.unmarkOneForRemoval),
      tap(action =>
        this.logger.debug('Unmarking one comic for removal:', action)
      ),
      switchMap(action =>
        this.comicService
          .singleComicRemoval({ comic: action.comic, removal: false })
          .pipe(
            tap(() =>
              this.alertService.info(
                this.translateService.instant(
                  'comic-removal-effects.unmark-one-for-removal.service-success'
                )
              )
            ),
            map(() => ComicRemovalActions.unmarkOneForRemovalSuccess()),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'comic-removal-effects.unmark-one-for-removal.service-failure'
                )
              );
              return of(ComicRemovalActions.unmarkOneForRemovalFailure());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.effects.general-failure')
        );
        return of(ComicRemovalActions.unmarkOneForRemovalFailure());
      })
    );
  });

  markSelectionsForRemoval$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ComicRemovalActions.markSelectionsForRemoval),
      tap(() => this.logger.debug('Marking selected comics for removal')),
      switchMap(() =>
        this.comicService.selectedComicsRemoval({ removal: true }).pipe(
          tap(() =>
            this.alertService.info(
              this.translateService.instant(
                'comic-removal-effects.mark-selections-for-removal.service-success'
              )
            )
          ),
          map(() => ComicRemovalActions.markSelectionsForRemovalSuccess()),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'comic-removal-effects.mark-selections-for-removal.service-failure'
              )
            );
            return of(ComicRemovalActions.markSelectionsForRemovalFailure());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.effects.general-failure')
        );
        return of(ComicRemovalActions.markSelectionsForRemovalFailure());
      })
    );
  });

  unmarkSelectionsForRemoval$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ComicRemovalActions.unmarkSelectionsForRemoval),
      tap(() => this.logger.debug('Unmarking selected comics for removal')),
      switchMap(() =>
        this.comicService.selectedComicsRemoval({ removal: false }).pipe(
          tap(() =>
            this.alertService.info(
              this.translateService.instant(
                'comic-removal-effects.unmark-selections-for-removal.service-success'
              )
            )
          ),
          map(() => ComicRemovalActions.unmarkSelectionsForRemovalSuccess()),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'comic-removal-effects.unmark-selections-for-removal.service-failure'
              )
            );
            return of(ComicRemovalActions.unmarkSelectionsForRemovalFailure());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.effects.general-failure')
        );
        return of(ComicRemovalActions.unmarkSelectionsForRemovalFailure());
      })
    );
  });
}
