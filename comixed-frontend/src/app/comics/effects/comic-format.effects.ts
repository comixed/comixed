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
import { catchError, map, switchMap, tap } from 'rxjs/operators';

import * as FormatsActions from '../actions/comic-format.actions';
import {
  comicFormatsLoaded,
  loadComicFormatsFailed
} from '../actions/comic-format.actions';
import { LoggerService } from '@angular-ru/logger';
import { ComicFormatService } from 'app/comics/services/comic-format.service';
import { ApiResponse } from 'app/core';
import { ComicFormat } from 'app/comics';
import { of } from 'rxjs';

@Injectable()
export class ComicFormatEffects {
  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private comicFormatService: ComicFormatService
  ) {}

  loadComicFormats$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(FormatsActions.loadComicFormats),
      tap(action =>
        this.logger.debug('Effect: loading comic formats:', action)
      ),
      switchMap(action =>
        this.comicFormatService.loadFormats().pipe(
          tap(response => this.logger.debug('Response received:', response)),
          tap(
            (response: ApiResponse<ComicFormat[]>) =>
              !response.success &&
              this.logger.error('Failed to load comic formats')
          ),
          map((response: ApiResponse<ComicFormat[]>) =>
            response.success
              ? comicFormatsLoaded({ formats: response.result })
              : loadComicFormatsFailed()
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            return of(loadComicFormatsFailed());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        return of(loadComicFormatsFailed());
      })
    );
  });
}
