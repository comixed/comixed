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
import { ComicFormatService } from '@app/comic/services/comic-format.service';
import { LoggerService } from '@angular-ru/logger';
import { TranslateService } from '@ngx-translate/core';
import {
  comicFormatsLoaded,
  loadComicFormats,
  loadComicFormatsFailed
} from '@app/comic/actions/comic-format.actions';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { ComicFormat } from '@app/comic/models/comic-format';
import { AlertService } from '@app/core/services/alert.service';

@Injectable()
export class ComicFormatEffects {
  loadFormats$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadComicFormats),
      tap(action => this.logger.debug('Effect: load comic formats:', action)),
      switchMap(action =>
        this.comicFormatService.loadFormats().pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map((response: ComicFormat[]) =>
            comicFormatsLoaded({ formats: response })
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'comic-format.load-formats.effect-failure'
              )
            );
            return of(loadComicFormatsFailed());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(loadComicFormatsFailed());
      })
    );
  });

  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private comicFormatService: ComicFormatService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}
}
