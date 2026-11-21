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
import { RescanComicsActions } from '../actions/rescan-comics.actions';
import { LoggerService } from '@angular-ru/cdk/logger';
import { ComicService } from '@app/library/services/comic-service';
import { AlertService } from '@app/services/alert-service';
import { TranslateService } from '@ngx-translate/core';
import { catchError, map, of, switchMap, tap } from 'rxjs';

@Injectable()
export class RescanComicsEffects {
  readonly logger = inject(LoggerService);
  readonly comicService = inject(ComicService);
  readonly alertService = inject(AlertService);
  readonly translateService = inject(TranslateService);
  private actions$ = inject(Actions);

  rescanSelectedComics$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(RescanComicsActions.rescanSelectedComics),
      tap(() => this.logger.debug('Rescanning selected comics')),
      switchMap(() =>
        this.comicService.rescanSelectedComics().pipe(
          tap(() =>
            this.alertService.info(
              this.translateService.instant(
                'rescan-comics-effects.rescan-selected-comics.service-success'
              )
            )
          ),
          map(() => RescanComicsActions.rescanSelectedComicsSuccess()),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'rescan-comics-effects.rescan-selected-comics.service-failure'
              )
            );
            return of(RescanComicsActions.rescanSelectedComicsFailure());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.effects.genreal-failure')
        );
        return of(RescanComicsActions.rescanSelectedComicsFailure());
      })
    );
  });
}
