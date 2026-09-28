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
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { ComicDetailAction } from '../actions/comic-detail.actions';
import { LoggerService } from '@angular-ru/cdk/logger';
import { ComicService } from '@app/library/services/comic-service';
import { AlertService } from '@app/services/alert-service';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class ComicDetailEffects {
  readonly logger = inject(LoggerService);
  readonly alertService = inject(AlertService);
  readonly translateService = inject(TranslateService);
  readonly comicService = inject(ComicService);
  private actions$ = inject(Actions);

  loadComic$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ComicDetailAction.load),
      tap(action => this.logger.debug('Loading comic:', action)),
      switchMap(action =>
        this.comicService.load({ comicId: action.comicId }).pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map(response =>
            ComicDetailAction.loadSuccess({
              comic: response.detail,
              pages: response.pages,
              tags: response.tags,
              metadata: response.metadata
            })
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'comic-detail-effect.load-comic.service-failure'
              ),
              '/library/all'
            );
            return of(ComicDetailAction.loadFailure());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.effect.general-failure'),
          '/library/all'
        );
        return of(ComicDetailAction.loadFailure());
      })
    );
  });

  saveComic$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ComicDetailAction.save),
      tap(action => this.logger.debug('Updating comic:', action)),
      switchMap(action =>
        this.comicService
          .save({
            comicId: action.comic.comicId,
            comicType: action.comic.comicType,
            publisher: action.comic.publisher,
            imprint: action.comic.imprint,
            series: action.comic.series,
            volume: action.comic.volume,
            issueNumber: action.comic.issueNumber,
            sortName: action.comic.sortName,
            title: action.comic.title,
            coverDate: action.comic.coverDate,
            storeDate: action.comic.storeDate
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            map(() => ComicDetailAction.saveSuccess()),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'comic-detail-effect.save-comic.service-failure'
                )
              );
              return of(ComicDetailAction.saveFailure());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.effect.general-failure')
        );
        return of(ComicDetailAction.saveFailure());
      })
    );
  });
}
