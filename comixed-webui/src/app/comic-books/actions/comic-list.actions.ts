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
import { ArchiveType } from '@app/comic-books/models/archive-type.enum';
import { ComicType } from '@app/comic-books/models/comic-type';
import { ComicState } from '@app/comic-books/models/comic-state';
import { DisplayableComic } from '@app/comic-books/models/displayable-comic';
import { ComicTagType } from '@app/comic-books/models/comic-tag-type';

export const resetComicList = createAction(
  '[Comic List] Resets the list of comics'
);

export const loadComicsByFilter = createAction(
  '[Comic List] Load a page worth of comic details',
  props<{
    pageSize: number;
    pageIndex: number;
    sortBy: string;
    sortDirection: string;
    coverYear: number;
    coverMonth: number;
    archiveType: ArchiveType;
    comicType: ComicType;
    comicState: ComicState;
    selected: boolean;
    unscrapedState: boolean;
    missing: boolean;
    searchText: string;
    publisher: string;
    series: string;
    volume: string;
    pageCount: number | null;
  }>()
);

export const loadComicsById = createAction(
  '[Comic Detail List] Load comics with the supplied ids',
  props<{ ids: number[] }>()
);

export const loadComicsForCollection = createAction(
  '[Comic Detail List] Load comics for a given collection type',
  props<{
    pageSize: number;
    pageIndex: number;
    tagType: ComicTagType;
    tagValue: string;
    sortBy: string;
    sortDirection: string;
  }>()
);

export const loadUnreadComics = createAction(
  '[Comic Detail List] Load unread comics',
  props<{
    pageSize: number;
    pageIndex: number;
    sortBy: string;
    sortDirection: string;
  }>()
);

export const loadReadComics = createAction(
  '[Comic Detail List] Load read comics',
  props<{
    pageSize: number;
    pageIndex: number;
    sortBy: string;
    sortDirection: string;
  }>()
);

export const loadComicsForReadingList = createAction(
  '[Comic Detail list] Load comics for reading list',
  props<{
    readingListId: number;
    pageSize: number;
    pageIndex: number;
    sortBy: string;
    sortDirection: string;
  }>()
);

export const loadComicsSuccess = createAction(
  '[Comic List] A page worth of comics were loaded',
  props<{
    comics: DisplayableComic[];
    totalCount: number;
    filteredCount: number;
    coverYears: number[];
    coverMonths: number[];
  }>()
);

export const loadComicsFailure = createAction(
  '[Comic List]  Loading a page worth of comic details failed'
);

export const comicUpdated = createAction(
  '[Comic List] Received an updated comic detail',
  props<{ comic: DisplayableComic }>()
);

export const comicRemoved = createAction(
  '[Comic List] Received an removed comic detail',
  props<{ comic: DisplayableComic }>()
);
