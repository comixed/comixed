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
import { ComicDetail } from '@app/comic-books/models/comic-detail';

export const resetComicBookList = createAction(
  '[Comic Book List] Indicates the loading process is started'
);

export const oldLoadComicBooks = createAction(
  '[Comic Book List] Load a batch of comics',
  props<{ maxRecords: number; lastId: number }>()
);

export const oldComicBooksReceived = createAction(
  '[Comic Book List] A batch of comics was received',
  props<{ comicBooks: ComicDetail[]; lastId: number; lastPayload: boolean }>()
);

export const oldLoadComicBooksFailed = createAction(
  '[Comic Book List] Failed to load a batch of comics'
);

export const comicBookListUpdateReceived = createAction(
  '[Comic Book List] A comic update was received',
  props<{ comicDetail: ComicDetail }>()
);

export const comicBookListRemovalReceived = createAction(
  '[Comic Book List] A comic removal was received',
  props<{ comicDetail: ComicDetail }>()
);

export const setComicBookListFilter = createAction(
  '[Comic Book List] Set the comic list filter',
  props<{ year: number; month: number }>()
);
