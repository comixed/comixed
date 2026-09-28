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
import { LibraryOrganizationActions } from '../actions/library-organization.actions';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { LoggerService } from '@angular-ru/cdk/logger';
import { LibraryService } from '@app/library/services/library-service';
import { AlertService } from '@app/services/alert-service';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class LibraryOrganizationEffects {
  readonly logger = inject(LoggerService);
  readonly libraryService = inject(LibraryService);
  readonly alertService = inject(AlertService);
  readonly translateService = inject(TranslateService);
  private actions$ = inject(Actions);

  organizeSelectedComics$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(LibraryOrganizationActions.organizeSelectedComics),
      tap(() => this.logger.debug('Organizing selected comics')),
      switchMap(() =>
        this.libraryService.organizeSelectedComics().pipe(
          tap(() =>
            this.alertService.info(
              this.translateService.instant(
                'library-organization-effects.organize-selected-comics.service-success'
              )
            )
          ),
          map(() => LibraryOrganizationActions.organizeSelectedComicsSuccess()),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'library-organization-effects.organize-selected-comics.service-failure'
              )
            );
            return of(
              LibraryOrganizationActions.organizeSelectedComicsFailure()
            );
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.effects.general-failure')
        );
        return of(LibraryOrganizationActions.organizeSelectedComicsFailure());
      })
    );
  });

  organizeAllComics$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(LibraryOrganizationActions.organizeAllComics),
      tap(() => this.logger.debug('Organizing selected comics')),
      switchMap(() =>
        this.libraryService.organizeAllComics().pipe(
          tap(() =>
            this.alertService.info(
              this.translateService.instant(
                'library-organization-effects.organize-all-comics.service-success'
              )
            )
          ),
          map(() => LibraryOrganizationActions.organizeAllComicsSuccess()),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'library-organization-effects.organize-all-comics.service-failure'
              )
            );
            return of(LibraryOrganizationActions.organizeAllComicsFailure());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.effects.general-failure')
        );
        return of(LibraryOrganizationActions.organizeAllComicsFailure());
      })
    );
  });
}
