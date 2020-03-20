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
import { Actions, Effect, ofType } from '@ngrx/effects';
import {
  PublisherActions,
  PublisherActionTypes,
  PublisherGetFailed,
  PublisherReceived
} from '../actions/publisher.actions';
import { Observable, of } from 'rxjs';
import { Action } from '@ngrx/store';
import { PublisherService } from 'app/library/services/publisher.service';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Publisher } from 'app/library/models/publisher';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { LoggerService } from '@angular-ru/logger';

@Injectable()
export class PublisherEffects {
  constructor(
    private actions$: Actions<PublisherActions>,
    private logger: LoggerService,
    private publisherService: PublisherService,
    private messageService: MessageService,
    private translateService: TranslateService
  ) {}

  @Effect()
  getPublisherByName$: Observable<Action> = this.actions$.pipe(
    ofType(PublisherActionTypes.Get),
    map(action => action.payload),
    tap(action => this.logger.debug('effect: getting publisher:', action)),
    switchMap(action =>
      this.publisherService.getPublisherByName(action.name).pipe(
        tap(response =>
          this.logger.debug('received publisher response:', response)
        ),
        map(
          (response: Publisher) =>
            new PublisherReceived({ publisher: response })
        ),
        catchError(error => {
          this.logger.error('service failure getting publisher:', error);
          this.messageService.add({
            severity: 'error',
            detail: this.translateService.instant(
              'publisher-effects.get-publisher-by-name.error.detail',
              {
                name: action.name
              }
            )
          });
          return of(new PublisherGetFailed());
        })
      )
    ),
    catchError(error => {
      this.logger.error('general failure getting publisher:', error);
      this.messageService.add({
        severity: 'error',
        detail: this.translateService.instant(
          'general-message.error.general-service-failure'
        )
      });
      return of(new PublisherGetFailed());
    })
  );
}
