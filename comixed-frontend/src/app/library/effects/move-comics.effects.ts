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
import {
  comicsMoving,
  moveComics,
  moveComicsFailed
} from 'app/library/actions/move-comics.actions';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { LoggerService } from '@angular-ru/logger';
import { LibraryService } from 'app/library/services/library.service';
import { AlertService, ApiResponse } from 'app/core';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

@Injectable()
export class MoveComicsEffects {
  constructor(
    private actions$: Actions,
    private logger: LoggerService,
    private libraryService: LibraryService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}

  moveComics$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(moveComics),
      tap(action => this.logger.debug('effects: move comics:', action)),
      switchMap(action =>
        this.libraryService
          .moveComics(
            action.deletePhysicalFiles,
            action.directory,
            action.renamingRule
          )
          .pipe(
            tap(response => this.logger.debug('received response:', response)),
            tap((response: ApiResponse<void>) =>
              response.success
                ? this.alertService.info(
                    this.translateService.instant(
                      'library.move-comics.effects.success-detail'
                    )
                  )
                : this.alertService.error(
                    this.translateService.instant(
                      'library.move-comics.effects.error-detail'
                    )
                  )
            ),
            map((response: ApiResponse<void>) =>
              response.success ? comicsMoving() : moveComicsFailed()
            ),
            catchError(error => {
              this.logger.error('service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'library.move-comics.effects.error-detail'
                )
              );
              return of(moveComicsFailed());
            })
          )
      ),
      catchError(error => {
        this.logger.error('general failure:', error);
        this.alertService.error(
          this.translateService.instant(
            'general-message.error.general-service-failure'
          )
        );
        return of(moveComicsFailed());
      })
    );
  });
}
