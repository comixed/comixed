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
import { RemoteLibraryActions } from '../actions/remote-library.actions';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { LoggerService } from '@angular-ru/cdk/logger';
import { AlertService } from '@app/services/alert-service';
import { TranslateService } from '@ngx-translate/core';
import { LibraryService } from '@app/library/services/library-service';

@Injectable()
export class RemoteLibraryEffects {
  readonly logger = inject(LoggerService);
  readonly libraryService = inject(LibraryService);
  readonly alertService = inject(AlertService);
  readonly translateService = inject(TranslateService);
  private actions$ = inject(Actions);
  loadState$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(RemoteLibraryActions.load),
      tap(() => this.logger.debug('Loading remote library state')),
      switchMap(() =>
        this.libraryService.loadState().pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map(response =>
            RemoteLibraryActions.loadSuccess({ state: response })
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'remote-library-effects.load-state.service-failure'
              )
            );
            return of(RemoteLibraryActions.loadFailure());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.effects.general-failure')
        );
        return of(RemoteLibraryActions.loadFailure());
      })
    );
  });
}
