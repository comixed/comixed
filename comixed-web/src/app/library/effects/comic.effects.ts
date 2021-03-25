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
import { LoggerService } from '@angular-ru/logger';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from '@app/core';
import { ComicService } from '@app/library/services/comic.service';
import {
  comicLoaded,
  comicUpdated,
  loadComic,
  loadComicFailed,
  updateComic,
  updateComicFailed
} from '@app/library/actions/comic.actions';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Comic } from '@app/library';
import { of } from 'rxjs';

@Injectable()
export class ComicEffects {
  loadOne$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadComic),
      tap(action => this.logger.debug('Effect: load comic:', action)),
      switchMap(action =>
        this.comicService.loadOne({ id: action.id }).pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map((response: Comic) => comicLoaded({ comic: response })),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant('comic.load-comic.effect-failure')
            );
            return of(loadComicFailed());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(loadComicFailed());
      })
    );
  });

  saveOne$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(updateComic),
      tap(action => this.logger.debug('Effect: update comic:', action)),
      switchMap(action =>
        this.comicService.updateOne({ comic: action.comic }).pipe(
          tap(response => this.logger.debug('Response received:', response)),
          tap(response =>
            this.alertService.info(
              this.translateService.instant('comic.save-changes.effect-success')
            )
          ),
          map((response: Comic) => comicUpdated({ comic: response })),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant('comic.save-changes.effect-failure')
            );
            return of(updateComicFailed());
          })
        )
      ),
      catchError(error => {
        this.logger.error('Service failure:', error);
        this.alertService.error(
          this.translateService.instant('comic.save-changes.effect-failure')
        );
        return of(updateComicFailed());
      })
    );
  });

  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private comicService: ComicService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}
}
