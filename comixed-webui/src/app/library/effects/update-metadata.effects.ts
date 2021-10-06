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
import { AlertService } from '@app/core/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import {
  metadataUpdating,
  updateMetadata,
  updateMetadataFailed
} from '@app/library/actions/update-metadata.actions.ts';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Comic } from '@app/comic-books/models/comic';
import { of } from 'rxjs';
import { LibraryService } from '@app/library/services/library.service';

@Injectable()
export class UpdateMetadataEffects {
  updateMetadata$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(updateMetadata),
      tap(action => this.logger.debug('Effect: updating comic info:', action)),
      switchMap(action =>
        this.libraryService.updateMetadata({ comics: action.comics }).pipe(
          tap(response => this.logger.debug('Response received:', response)),
          tap((response: Comic) =>
            this.alertService.info(
              this.translateService.instant(
                'library.update-metadata.effect-success'
              )
            )
          ),
          map((response: Comic) => metadataUpdating()),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'library.update-metadata.effect-failure'
              )
            );
            return of(updateMetadataFailed());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(updateMetadataFailed());
      })
    );
  });

  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private libraryService: LibraryService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}
}
