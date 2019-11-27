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

import { Action } from '@ngrx/store';
import { CollectionType } from 'app/library/models/collection-type.enum';
import { CollectionEntry } from 'app/library/models/collection-entry';
import { Comic } from 'app/comics';

export enum CollectionActionTypes {
  Load = '[COLLECTION] Load a collection',
  Received = '[COLLECTION] Collection received',
  LoadFailed = '[COLLECTION] Failed to load a collection',
  GetComics = '[COLLECTION] Get comics for a collection',
  ComicsReceived = '[COLLECTION] Comics for a collection received',
  GetComicsFailed = '[COLLECTION] Failed to get comics for a collection'
}

export class CollectionLoad implements Action {
  readonly type = CollectionActionTypes.Load;

  constructor(public payload: { collectionType: CollectionType }) {}
}

export class CollectionReceived implements Action {
  readonly type = CollectionActionTypes.Received;

  constructor(public payload: { entries: CollectionEntry[] }) {}
}

export class CollectionLoadFailed implements Action {
  readonly type = CollectionActionTypes.LoadFailed;

  constructor() {}
}

export class CollectionGetComics implements Action {
  readonly type = CollectionActionTypes.GetComics;

  constructor(
    public payload: {
      collectionType: CollectionType;
      name: string;
      page: number;
      count: number;
      sortField: string;
      ascending: boolean;
    }
  ) {}
}

export class CollectionComicsReceived implements Action {
  readonly type = CollectionActionTypes.ComicsReceived;

  constructor(public payload: { comics: Comic[]; comicCount: number }) {}
}

export class CollectionGetComicsFailed implements Action {
  readonly type = CollectionActionTypes.GetComicsFailed;

  constructor() {}
}

export type CollectionActions =
  | CollectionLoad
  | CollectionReceived
  | CollectionLoadFailed
  | CollectionGetComics
  | CollectionComicsReceived
  | CollectionGetComicsFailed;
