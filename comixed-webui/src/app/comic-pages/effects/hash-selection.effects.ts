/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2024, The ComiXed Project
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
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import {
  addAllHashesToSelection,
  addHashSelection,
  clearHashSelections,
  loadHashSelections,
  loadHashSelectionsFailure,
  loadHashSelectionsSuccess,
  removeHashSelection
} from '../actions/hash-selection.actions';
import { LoggerService } from '@angular-ru/cdk/logger';
import { HashSelectionService } from '@app/comic-pages/services/hash-selection.service';
import { AlertService } from '@app/core/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

@Injectable()
export class HashSelectionEffects {
  loadHashSelections$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadHashSelections),
      tap(() => this.logger.trace('Loading hash selections')),
      switchMap(() =>
        this.hashSelectionService.loadSelections().pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map((response: string[]) =>
            loadHashSelectionsSuccess({ entries: response })
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'load-hash-selections.effect-failure'
              )
            );
            return of(loadHashSelectionsFailure());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(loadHashSelectionsFailure());
      })
    );
  });

  addAllHashes$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(addAllHashesToSelection),
      tap(() => this.logger.trace('Selecting all duplicate hashes')),
      switchMap(() =>
        this.hashSelectionService.selectAll().pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map((response: string[]) =>
            loadHashSelectionsSuccess({ entries: response })
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant('add-all-hashes.effect-failure')
            );
            return of(loadHashSelectionsFailure());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(loadHashSelectionsFailure());
      })
    );
  });

  addSelection$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(addHashSelection),
      tap(action => this.logger.trace('Adding hash selection:', action)),
      switchMap(action =>
        this.hashSelectionService.addSelection({ hash: action.hash }).pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map((response: string[]) =>
            loadHashSelectionsSuccess({ entries: response })
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant('add-hash-selection.effect-failure')
            );
            return of(loadHashSelectionsFailure());
          })
        )
      ),
      catchError(error => {
        this.logger.error('Service failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(loadHashSelectionsFailure());
      })
    );
  });

  removeSelection$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(removeHashSelection),
      tap(action => this.logger.trace('Adding hash selection:', action)),
      switchMap(action =>
        this.hashSelectionService.removeSelection({ hash: action.hash }).pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map((response: string[]) =>
            loadHashSelectionsSuccess({ entries: response })
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'remove-hash-selection.effect-failure'
              )
            );
            return of(loadHashSelectionsFailure());
          })
        )
      ),
      catchError(error => {
        this.logger.error('Service failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(loadHashSelectionsFailure());
      })
    );
  });

  clearSelections$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(clearHashSelections),
      tap(() => this.logger.trace('Clearing hash selections')),
      switchMap(() =>
        this.hashSelectionService.clearSelections().pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map(() => loadHashSelectionsSuccess({ entries: [] })),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'clear-hash-selections.effect-failure'
              )
            );
            return of(loadHashSelectionsFailure());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(loadHashSelectionsFailure());
      })
    );
  });

  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private hashSelectionService: HashSelectionService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}
}
