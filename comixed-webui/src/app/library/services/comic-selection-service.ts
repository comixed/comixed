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

import { inject, Service } from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { interpolate } from '@app/app-functions';
import {
  CLEAR_COMIC_SELECTIONS_URL,
  DESELECT_SINGLE_COMIC_URL,
  LOAD_SELECTED_COMIC_ID_LIST_URL,
  SELECT_SINGLE_COMIC_URL,
  SET_SELECTED_BY_FILTER_URL,
  SET_SELECTED_BY_READ_STATE_URL
} from '@app/library/library-constants';
import { Comic } from '@app/library/models/comic';
import { SetSelectedByReadStateRequest } from '@app/library/models/net/set-selected-by-read-state-request';
import { ArchiveType } from '@app/library/models/archive-type';
import { ComicType } from '@app/library/models/comic-type';
import { ComicState } from '@app/library/models/comic-state';
import { MultipleComicSelectionRequest } from '@app/library/models/net/multiple-comic-selection-request';

@Service()
export class ComicSelectionService {
  readonly logger = inject(LoggerService);
  readonly http = inject(HttpClient);

  loadSelectComicIds(): Observable<number[]> {
    this.logger.debug('Loading selected comic id list');
    return this.http.get<number[]>(
      interpolate(LOAD_SELECTED_COMIC_ID_LIST_URL)
    );
  }

  clearSelections(): Observable<void> {
    this.logger.debug('Clearing the comic selections');
    return this.http.delete<void>(interpolate(CLEAR_COMIC_SELECTIONS_URL));
  }

  singleComicSelection(args: {
    comic: Comic;
    selected: boolean;
  }): Observable<void> {
    if (args.selected) {
      this.logger.debug('Selecting a single comic:', args);
      return this.http.put<void>(
        interpolate(SELECT_SINGLE_COMIC_URL, { comicId: args.comic.comicId }),
        {} as unknown
      );
    } else {
      this.logger.debug('Deselecting a single comic:', args);
      return this.http.delete<void>(
        interpolate(DESELECT_SINGLE_COMIC_URL, { comicId: args.comic.comicId })
      );
    }
  }

  setSelectedByReadState(args: {
    readState: boolean;
    selected: boolean;
  }): Observable<void> {
    this.logger.debug('Selecting by read state:', args);
    return this.http.post<void>(interpolate(SET_SELECTED_BY_READ_STATE_URL), {
      unreadOnly: !args.readState,
      selected: args.selected
    } as SetSelectedByReadStateRequest);
  }

  setSelectedByFilter(args: {
    coverYear: number | null;
    coverMonth: number | null;
    archiveType: ArchiveType | null;
    comicType: ComicType | null;
    comicState: ComicState | null;
    unscrapedState: boolean;
    searchText: string;
    selected: boolean;
  }): Observable<void> {
    this.logger.trace('Selecting by filter state:', args);
    return this.http.post<void>(interpolate(SET_SELECTED_BY_FILTER_URL), {
      coverYear: args.coverYear,
      coverMonth: args.coverMonth,
      archiveType: args.archiveType,
      comicType: args.comicType,
      comicState: args.comicState,
      unscrapedState: args.unscrapedState,
      searchText: args.searchText,
      selected: args.selected
    } as MultipleComicSelectionRequest);
  }
}
