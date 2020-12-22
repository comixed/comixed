/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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
import { LibraryService } from '@app/library/services/library.service';
import { LoggerService } from '@angular-ru/logger';
import { AlertService } from '@app/core';
import { TranslateService } from '@ngx-translate/core';
import {
  comicLoaded,
  loadComic,
  loadComicFailed
} from '@app/library/actions/library.actions';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Comic } from '@app/library';
import { of } from 'rxjs';

@Injectable()
export class LibraryEffects {
  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private comicService: LibraryService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}

  loadComic$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadComic),
      tap(action => this.logger.debug('Effect: load comic:', action)),
      switchMap(action =>
        this.comicService.loadComic({ id: action.id }).pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map((response: Comic) => comicLoaded({ comic: response })),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'comic.load-comic.effect-failure-detail'
              )
            );
            return of(loadComicFailed());
          })
        )
      ),
      catchError(error => {
        this.logger.error('general failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(loadComicFailed());
      })
    );
  });
}
