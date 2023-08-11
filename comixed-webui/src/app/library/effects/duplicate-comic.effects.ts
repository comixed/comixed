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

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  duplicateComicsLoaded,
  loadDuplicateComics,
  loadDuplicateComicsFailed
} from '@app/library/actions/duplicate-comic.actions';
import { LoggerService } from '@angular-ru/cdk/logger';
import { DuplicateComicService } from '@app/library/services/duplicate-comic.service';
import { AlertService } from '@app/core/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { ComicDetail } from '@app/comic-books/models/comic-detail';

@Injectable()
export class DuplicateComicEffects {
  loadDuplicateComics$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadDuplicateComics),
      tap(() => this.logger.trace('Loading duplicate comics')),
      switchMap(() =>
        this.duplicateComicService.loadDuplicateComics().pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map((response: ComicDetail[]) =>
            duplicateComicsLoaded({ comics: response })
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'duplicate-comic-book-list.load-list.effect-failure'
              )
            );
            return of(loadDuplicateComicsFailed());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(loadDuplicateComicsFailed());
      })
    );
  });

  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private duplicateComicService: DuplicateComicService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}
}
