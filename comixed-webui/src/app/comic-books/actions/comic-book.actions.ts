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
import { ComicPage } from '@app/comic-books/models/comic-page';
import { PageOrderEntry } from '@app/comic-books/models/net/page-order-entry';
import { ComicType } from '@app/comic-books/models/comic-type';
import { DisplayableComic } from '@app/comic-books/models/displayable-comic';
import { ComicMetadataSource } from '@app/comic-books/models/comic-metadata-source';
import { ComicTag } from '@app/comic-books/models/comic-tag';

export const loadComicBook = createAction(
  '[Comic Book] Loads a single comic',
  props<{ id: number }>()
);

export const comicBookLoaded = createAction(
  '[Comic Book] A single comic was loaded',
  props<{
    details: DisplayableComic;
    metadata: ComicMetadataSource;
    pages: ComicPage[];
    tags: ComicTag[];
  }>()
);

export const loadComicBookFailed = createAction(
  '[Comic Book] Failed to load a single comic'
);

export const updateComicBook = createAction(
  '[Comic Book] Update a comic',
  props<{
    comicBookId: number;
    comicType?: ComicType;
    publisher: string;
    series: string;
    volume: string;
    issueNumber: string;
    imprint?: string;
    sortName?: string;
    title?: string;
    storeDate?: number;
    coverDate?: number;
  }>()
);

export const comicBookUpdated = createAction(
  '[Comic Book] ComicBook updated',
  props<{
    details: DisplayableComic;
    metadata: ComicMetadataSource;
    pages: ComicPage[];
  }>()
);

export const updateComicBookFailed = createAction(
  '[Comic Book] Failed to update a comic'
);

export const updatePageDeletion = createAction(
  '[Comic Book] Update page deletion state',
  props<{ pages: ComicPage[]; deleted: boolean }>()
);

export const pageDeletionUpdated = createAction(
  '[Comic Book] Page deletion was updated'
);

export const updatePageDeletionFailed = createAction(
  '[Comic Book] Failed to update page deletion state'
);

export const savePageOrder = createAction(
  '[Comic Book] Save page order',
  props<{ comicBookId: number; entries: PageOrderEntry[] }>()
);

export const pageOrderSaved = createAction('[Comic Book] Page order saved');

export const savePageOrderFailed = createAction(
  '[Comic Book] Save page order failed'
);

export const downloadComicBook = createAction(
  '[Comic Book] Attempt to download a comic book file',
  props<{ comicBookId: number }>()
);

export const downloadComicBookSuccess = createAction(
  '[Comic Book] Download comic book file started'
);

export const downloadComicBookFailure = createAction(
  '[Comic Book] Failed to download a comic book file'
);
