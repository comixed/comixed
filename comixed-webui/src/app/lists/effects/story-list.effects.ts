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
  loadStoriesForName,
  loadStoriesForNameFailed,
  loadStoryNames,
  loadStoryNamesFailed,
  storiesForNameLoaded,
  storyNamesLoaded
} from '../actions/story-list.actions';
import { LoggerService } from '@angular-ru/logger';
import { StoryService } from '@app/lists/services/story.service';
import { AlertService } from '@app/core/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Story } from '@app/lists/models/story';

@Injectable()
export class StoryListEffects {
  loadStoryNames$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadStoryNames),
      tap(action => this.logger.trace('Loading all story names:', action)),
      switchMap(action =>
        this.storyService.loadAllNames().pipe(
          tap(response => this.logger.debug('Resonse received:', response)),
          map((response: string[]) => storyNamesLoaded({ names: response })),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'story-list.load-story-names.effect-failure'
              )
            );
            return of(loadStoryNamesFailed());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(loadStoryNamesFailed());
      })
    );
  });

  loadStoriesForName$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadStoriesForName),
      tap(action => this.logger.trace('Loading all stories for name:', action)),
      switchMap(action =>
        this.storyService.loadForName({ name: action.name }).pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map((response: Story[]) =>
            storiesForNameLoaded({ stories: response })
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'story-list.load-stories-for-name.effect-failure',
                { name: action.name }
              )
            );
            return of(loadStoriesForNameFailed());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(loadStoriesForNameFailed());
      })
    );
  });

  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private storyService: StoryService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}
}
