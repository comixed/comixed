/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2025, The ComiXed Project
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
import { StoryMetadata } from '@app/collections/models/story-metadata';

export const resetStoryCandidates = createAction(
  '[Scrape Story] Reset the list of candidates for a story'
);

export const loadStoryCandidates = createAction(
  '[Scrape Story] Load candidates for a story',
  props<{
    sourceId: number;
    name: string;
    maxRecords: number;
    skipCache: boolean;
  }>()
);

export const loadStoryCandidatesSuccess = createAction(
  '[Scrape Story] Story candidates for a collection loaded',
  props<{
    candidates: StoryMetadata[];
  }>()
);

export const loadStoryCandidatesFailure = createAction(
  '[Scrape Story] Failed to load candidates for a story'
);

export const scrapeStoryMetadata = createAction(
  '[Scrape Story] Scrape the metadata for a story',
  props<{
    sourceId: number;
    referenceId: string;
    skipCache: boolean;
  }>()
);

export const scrapeStoryMetadataSuccess = createAction(
  '[Scrape Story] Successfully scraped the metadata for a story'
);

export const scrapeStoryMetadataFailure = createAction(
  '[Scrape Story] Failed to scrape the metadata for a story'
);
