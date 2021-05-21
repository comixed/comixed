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
import { AlertService } from '@app/core/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import {
  readStateSet,
  setReadState,
  setReadStateFailed
} from '@app/library/actions/library.actions';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable()
export class LibraryEffects {
  setRead$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(setReadState),
      tap(action => this.logger.debug('Effect: set read state:', action)),
      switchMap(action =>
        this.comicService
          .setRead({ comics: action.comics, read: action.read })
          .pipe(
            tap(response => this.logger.debug('Response receieved:', response)),
            tap(() =>
              this.alertService.info(
                this.translateService.instant(
                  'library.set-read.effect-success',
                  {
                    count: action.comics.length,
                    read: action.read
                  }
                )
              )
            ),
            map(() => readStateSet()),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant('library.set-read.effect-failure')
              );
              return of(setReadStateFailed());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(setReadStateFailed());
      })
    );
  });

  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private comicService: LibraryService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}
}
