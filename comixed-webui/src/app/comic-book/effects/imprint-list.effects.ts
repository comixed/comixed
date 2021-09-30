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
import {
  imprintsLoaded,
  loadImprints,
  loadImprintsFailed
} from '../actions/imprint-list.actions';
import { LoggerService } from '@angular-ru/logger';
import { ImprintService } from '@app/comic-book/services/imprint.service';
import { AlertService } from '@app/core/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Imprint } from '@app/comic-book/models/imprint';
import { of } from 'rxjs';

@Injectable()
export class ImprintListEffects {
  loadAll$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadImprints),
      tap(action => this.logger.trace('Loading all imports:', action)),
      switchMap(action =>
        this.imprintService.loadAll().pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map((response: Imprint[]) => imprintsLoaded({ entries: response })),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant('imprint.load-all.effect-failure')
            );
            return of(loadImprintsFailed());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(loadImprintsFailed());
      })
    );
  });

  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private imprintService: ImprintService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}
}
