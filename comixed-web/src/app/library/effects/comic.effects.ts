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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { LoggerService } from '@angular-ru/logger';
import {
  comicSaved,
  saveComicDetails,
  saveComicDetailsFailed
} from '../actions/comic-details.actions';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { ComicDetailsService } from '../services/comic-details.service';
import { AlertService } from '@app/core';
import { TranslateService } from '@ngx-translate/core';
import { Comic } from '@app/library';
import { of } from 'rxjs';

@Injectable()
export class ComicEffects {
  constructor(
    private logger: LoggerService,
    private comicService: ComicDetailsService,
    private alertService: AlertService,
    private translateService: TranslateService,
    private actions$: Actions
  ) {}

  saveComicDetail$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(saveComicDetails),
      tap(() => this.logger.debug('effect: save comic details')),
      switchMap(action =>
        this.comicService.saveComic(action.comic).pipe(
          tap(() =>
            this.alertService.info(
              this.translateService.instant(
                'comic.comic-effects.save-comic.success.detail'
              )
            )
          ),
          map((response: Comic) => comicSaved({ comic: response })),
          catchError(error => {
            this.logger.error('service failure save comic:', error);
            this.alertService.error(
              this.translateService.instant(
                'comic.comic-effects.save-comic.error.detail'
              )
            );
            return of(saveComicDetailsFailed);
          })
        )
      ),
      catchError(error => {
        this.logger.error('geneservice failure save comic:', error);
        this.alertService.error(
          this.translateService.instant(
            'general-message.error.general-service-failure'
          )
        );
        return of(saveComicDetailsFailed);
      })
    );
  });
}
