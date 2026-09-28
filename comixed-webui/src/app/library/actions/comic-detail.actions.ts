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

import { createAction, props } from '@ngrx/store';
import { Comic } from '@app/library/models/comic';
import { ComicPage } from '@app/library/models/comic-page';
import { ComicTag } from '@app/library/models/comic-tag';
import { ComicMetadataSource } from '../models/comic-metadata-source';

export const loadComic = createAction(
  '[Comic Detail] Load a comic',
  props<{ comicId: number }>()
);

export const loadComicSuccess = createAction(
  '[Comic Detail] Load a comic success',
  props<{
    comic: Comic;
    pages: ComicPage[];
    tags: ComicTag[];
    metadata: ComicMetadataSource;
  }>()
);

export const loadComicFailure = createAction(
  '[Comic Detail] Load a comic failure'
);

export const comicUpdateReceived = createAction(
  '[Comic Detail] Comic update received',
  props<{
    comic: Comic;
    pages: ComicPage[];
    tags: ComicTag[];
    metadata: ComicMetadataSource;
  }>()
);

export const updateComic = createAction(
  '[Comic Detail] Save a comic',
  props<{ comic: Comic }>()
);

export const updateComicSuccess = createAction(
  '[Comic Detail] Comic update success'
);

export const updateComicFailure = createAction(
  '[Comic Detail] Comic update failure'
);
