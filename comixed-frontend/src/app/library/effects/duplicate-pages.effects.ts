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
 * along with this program. If not, see <http:/www.gnu.org/licenses>
 */

import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import {
  DuplicatePagesActions,
  DuplicatePagesActionTypes,
  DuplicatePagesAllReceived,
  DuplicatePagesBlockingSet,
  DuplicatePagesGetAllFailed,
  DuplicatePagesSetBlockingFailed
} from 'app/library/actions/duplicate-pages.actions';
import { DuplicatePagesService } from 'app/library/services/duplicate-pages.service';
import { Observable, of } from 'rxjs';
import { Action } from '@ngrx/store';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { DuplicatePage } from 'app/library/models/duplicate-page';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class DuplicatePagesEffects {
  constructor(
    private actions$: Actions<DuplicatePagesActions>,
    private duplicatePagesService: DuplicatePagesService,
    private messageService: MessageService,
    private translateService: TranslateService
  ) {}

  @Effect()
  getAll$: Observable<Action> = this.actions$.pipe(
    ofType(DuplicatePagesActionTypes.GetAll),
    switchMap(action =>
      this.duplicatePagesService.getAll().pipe(
        map(
          (response: DuplicatePage[]) =>
            new DuplicatePagesAllReceived({ pages: response })
        ),
        catchError(error => {
          this.messageService.add({
            severity: 'error',
            detail: this.translateService.instant(
              'duplicate-pages-effects.get-all.error.detail'
            )
          });
          return of(new DuplicatePagesGetAllFailed());
        })
      )
    ),
    catchError(error => {
      this.messageService.add({
        severity: 'error',
        detail: this.translateService.instant(
          'general-message.error.general-service-failure'
        )
      });
      return of(new DuplicatePagesGetAllFailed());
    })
  );

  @Effect()
  setBlocking$: Observable<Action> = this.actions$.pipe(
    ofType(DuplicatePagesActionTypes.SetBlocking),
    map(action => action.payload),
    switchMap(action =>
      this.duplicatePagesService
        .setBlocking(action.pages, action.blocking)
        .pipe(
          tap(() =>
            this.messageService.add({
              severity: 'info',
              detail: this.translateService.instant(
                'duplicate-pages-effects.set-blocking.success.detail',
                { count: action.pages.length, blocked: action.blocking }
              )
            })
          ),
          map(
            (response: DuplicatePage[]) =>
              new DuplicatePagesBlockingSet({ pages: response })
          ),
          catchError(error => {
            this.messageService.add({
              severity: 'error',
              detail: this.translateService.instant(
                'duplicate-pages-effects.set-blocking.error.detail'
              )
            });
            return of(new DuplicatePagesSetBlockingFailed());
          })
        )
    ),
    catchError(error => {
      this.messageService.add({
        severity: 'error',
        detail: this.translateService.instant(
          'general-message.error.general-service-failure'
        )
      });
      return of(new DuplicatePagesSetBlockingFailed());
    })
  );
}
