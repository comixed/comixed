/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';

import { catchError, concatMap, map, switchMap } from 'rxjs/operators';
import { EMPTY, Observable, of } from 'rxjs';
import {
  BuildDetailsActionTypes,
  BuildDetailsActions,
  BuildDetailsReceive,
  BuildDetailsGetFailed
} from '../actions/build-details.actions';
import { Action } from '@ngrx/store';
import { BuildDetailsService } from 'app/backend-status/services/build-details.service';
import { BuildDetails } from 'app/backend-status/models/build-details';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class BuildDetailsEffects {
  constructor(
    private actions$: Actions<BuildDetailsActions>,
    private build_details_service: BuildDetailsService,
    private message_service: MessageService,
    private translate_service: TranslateService
  ) {}

  @Effect()
  get_build_details$: Observable<Action> = this.actions$.pipe(
    ofType(BuildDetailsActionTypes.GetBuildDetails),
    switchMap(action =>
      this.build_details_service.get_build_details().pipe(
        map(
          (response: BuildDetails) =>
            new BuildDetailsReceive({ build_details: response })
        ),
        catchError(error => {
          this.message_service.add({
            severity: 'error',
            detail: this.translate_service.instant(
              'build-details-effects.get-build-details.error.detail'
            )
          });
          return of(new BuildDetailsGetFailed());
        })
      )
    ),
    catchError(error => {
      this.message_service.add({
        severity: 'error',
        detail: this.translate_service.instant(
          'general-message.error.general-service-failure'
        )
      });
      return of(new BuildDetailsGetFailed());
    })
  );
}
