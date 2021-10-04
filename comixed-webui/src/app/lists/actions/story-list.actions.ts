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

import { createAction, props } from '@ngrx/store';
import { Story } from '@app/lists/models/story';

export const loadStoryNames = createAction(
  '[Story List] Loads all story names'
);

export const storyNamesLoaded = createAction(
  '[Story List] All story names loaded',
  props<{ names: string[] }>()
);

export const loadStoryNamesFailed = createAction(
  '[Story List] Loads all story names failed'
);

export const loadStoriesForName = createAction(
  '[Story List] Loads all stories for a name',
  props<{ name: string }>()
);

export const storiesForNameLoaded = createAction(
  '[Story List] All stories for a name are loaded',
  props<{ stories: Story[] }>()
);

export const loadStoriesForNameFailed = createAction(
  '[Story List] Failed to load all stories for a name'
);
