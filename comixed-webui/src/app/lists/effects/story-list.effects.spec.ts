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

import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';

import { StoryListEffects } from './story-list.effects';
import { STORY_1, STORY_2, STORY_3 } from '@app/lists/lists.fixtures';
import { StoryService } from '@app/lists/services/story.service';
import { AlertService } from '@app/core/services/alert.service';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {
  loadStoriesForName,
  loadStoriesForNameFailed,
  loadStoryNames,
  loadStoryNamesFailed,
  storiesForNameLoaded,
  storyNamesLoaded
} from '@app/lists/actions/story-list.actions';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse } from '@angular/common/http';

describe('StoryListEffects', () => {
  const ENTRIES = [STORY_1, STORY_2, STORY_3];
  const NAMES = ENTRIES.map(story => story.name);

  let actions$: Observable<any>;
  let effects: StoryListEffects;
  let storyService: jasmine.SpyObj<StoryService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatSnackBarModule
      ],
      providers: [
        StoryListEffects,
        provideMockActions(() => actions$),
        {
          provide: StoryService,
          useValue: {
            loadAllNames: jasmine.createSpy('StoryService.loadAllNames()'),
            loadForName: jasmine.createSpy('StoryService.loadForName()')
          }
        },
        AlertService
      ]
    });

    effects = TestBed.inject(StoryListEffects);
    storyService = TestBed.inject(StoryService) as jasmine.SpyObj<StoryService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading all story names', () => {
    it('fires an action on success', () => {
      const serviceResponse = NAMES;
      const action = loadStoryNames();
      const outcome = storyNamesLoaded({ names: NAMES });

      actions$ = hot('-a', { a: action });
      storyService.loadAllNames.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadStoryNames$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadStoryNames();
      const outcome = loadStoryNamesFailed();

      actions$ = hot('-a', { a: action });
      storyService.loadAllNames.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadStoryNames$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadStoryNames();
      const outcome = loadStoryNamesFailed();

      actions$ = hot('-a', { a: action });
      storyService.loadAllNames.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadStoryNames$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('loading all stories for a name', () => {
    it('fires an action on success', () => {
      const serviceResponse = ENTRIES;
      const action = loadStoriesForName({ name: NAMES[0] });
      const outcome = storiesForNameLoaded({ stories: ENTRIES });

      actions$ = hot('-a', { a: action });
      storyService.loadForName
        .withArgs({ name: NAMES[0] })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadStoriesForName$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadStoriesForName({ name: NAMES[0] });
      const outcome = loadStoriesForNameFailed();

      actions$ = hot('-a', { a: action });
      storyService.loadForName
        .withArgs({ name: NAMES[0] })
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadStoriesForName$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadStoriesForName({ name: NAMES[0] });
      const outcome = loadStoriesForNameFailed();

      actions$ = hot('-a', { a: action });
      storyService.loadForName
        .withArgs({ name: NAMES[0] })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadStoriesForName$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
