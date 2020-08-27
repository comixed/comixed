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
 * along with this program. If not, see <http:/www.gnu.org/licenses>
 */

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';

import {
  comicsImporting,
  importComics,
  importComicsFailed
} from '../actions/import-comics.actions';
import { LoggerService } from '@angular-ru/logger';
import { TranslateService } from '@ngx-translate/core';
import { ComicImportService } from 'app/comic-import/services/comic-import.service';
import { AlertService, ApiResponse } from 'app/core';

@Injectable()
export class ImportComicsEffects {
  constructor(
    private actions$: Actions,
    private logger: LoggerService,
    private alertService: AlertService,
    private translateService: TranslateService,
    private comicImportService: ComicImportService
  ) {}

  importComics$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(importComics),
      tap(action => this.logger.trace('effect: import comics:', action)),
      switchMap(action =>
        this.comicImportService
          .startImport(
            action.files,
            action.ignoreMetadata,
            action.deleteBlockedPages
          )
          .pipe(
            tap(response => this.logger.trace('received response:', response)),
            tap((response: ApiResponse<void>) =>
              response.success
                ? this.alertService.info(
                    this.translateService.instant(
                      'comic-import.effects.import-comics.success-detail'
                    )
                  )
                : this.alertService.error(
                    this.translateService.instant(
                      'comic-import.effects.import-comics.error-detail'
                    )
                  )
            ),
            map((response: ApiResponse<void>) =>
              response.success ? comicsImporting() : importComicsFailed()
            ),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'comic-import.effects.import-comics.error-detail'
                )
              );
              return of(importComicsFailed());
            })
          )
      ),
      catchError(error => {
        this.logger.error('Service failure:', error);
        this.alertService.error(
          this.translateService.instant(
            'general-message.error.general-service-failure'
          )
        );
        return of(importComicsFailed());
      })
    );
  });
}
