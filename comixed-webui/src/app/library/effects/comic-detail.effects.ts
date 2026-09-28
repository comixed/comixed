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
import { map, switchMap, tap } from 'rxjs';
import { loadComic, loadComicSuccess } from '../actions/comic-detail.actions';
import { LoggerService } from '@angular-ru/cdk/logger';
import { ComicService } from '@app/library/services/comic-service';

@Injectable()
export class ComicDetailEffects {
  readonly logger = inject(LoggerService);
  readonly comicService = inject(ComicService);
  private actions$ = inject(Actions);
  loadComic$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadComic),
      tap(action => this.logger.debug('Loading comic:', action)),
      switchMap(action =>
        this.comicService.loadComic({ comicId: action.comicId }).pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map(response =>
            loadComicSuccess({
              comic: response.detail,
              pages: response.pages,
              tags: response.tags,
              metadata: response.metadata
            })
          )
        )
      )
    );
  });
}
