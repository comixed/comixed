/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import * as DuplicatesActions from '../actions/duplicate-pages.actions';
import { ComicService } from '../services/comic.service';
import { DuplicatePage } from '../models/comics/duplicate-page';

@Injectable()
export class DuplicatesEffects {
  constructor(
    private actions$: Actions,
    private comic_service: ComicService,
  ) { }

  @Effect()
  duplicates_fetch_pages$: Observable<Action> = this.actions$
    .ofType<DuplicatesActions.DuplicatePagesFetchPages>(DuplicatesActions.DUPLICATE_PAGES_FETCH_PAGES)
    .switchMap(action =>
      this.comic_service.get_duplicate_pages()
        .map((duplicate_pages: Array<DuplicatePage>) => new DuplicatesActions.DuplicatePagesSetPages(duplicate_pages))
    );

  @Effect()
  duplicates_delete_all$: Observable<Action> = this.actions$
    .ofType<DuplicatesActions.DuplicatePagesDeleteAll>(DuplicatesActions.DUPLICATE_PAGES_DELETE_ALL)
    .map(action => action.payload)
    .switchMap(action =>
      this.comic_service.delete_all_pages_for_hash(action)
        .map((count: number) => new DuplicatesActions.DuplicatePagesDeletedForHash({
          count: count,
          hash: action,
        }))
    );

  @Effect()
  duplicates_undelete_all$: Observable<Action> = this.actions$
    .ofType<DuplicatesActions.DuplicatePagesUndeleteAll>(DuplicatesActions.DUPLICATE_PAGES_UNDELETE_ALL)
    .map(action => action.payload)
    .switchMap(action =>
      this.comic_service.undelete_all_pages_for_hash(action)
        .map((count: number) => new DuplicatesActions.DuplicatePagesUndeletedForHash({
          count: count,
          hash: action,
        }))
    );

  @Effect()
  duplicates_block_hash$: Observable<Action> = this.actions$
    .ofType<DuplicatesActions.DuplicatePagesBlockHash>(DuplicatesActions.DUPLICATE_PAGES_BLOCK_HASH)
    .map(action => action.payload)
    .switchMap(action =>
      this.comic_service.block_page(action)
        .map(() => new DuplicatesActions.DuplicatePagesBlockedHash({
          blocked: true,
          hash: action,
        })));

  @Effect()
  duplicates_unblock_hash$: Observable<Action> = this.actions$
    .ofType<DuplicatesActions.DuplicatePagesUnblockHash>(DuplicatesActions.DUPLICATE_PAGES_UNBLOCK_HASH)
    .map(action => action.payload)
    .switchMap(action =>
      this.comic_service.unblock_page(action)
        .map(() => new DuplicatesActions.DuplicatePagesBlockedHash({
          blocked: false,
          hash: action,
        })));

  @Effect()
  duplicates_delete_page$: Observable<Action> = this.actions$
    .ofType<DuplicatesActions.DuplicatePagesDeletePage>(DuplicatesActions.DUPLICATE_PAGES_DELETE_PAGE)
    .map(action => action.payload)
    .switchMap(action =>
      this.comic_service.mark_page_as_deleted(action)
        .map(() => new DuplicatesActions.DuplicatePagesPageDeleted(action)));

  @Effect()
  duplicates_undelete_page$: Observable<Action> = this.actions$
    .ofType<DuplicatesActions.DuplicatePagesUndeletePage>(DuplicatesActions.DUPLICATE_PAGES_UNDELETE_PAGE)
    .map(action => action.payload)
    .switchMap(action =>
      this.comic_service.mark_page_as_undeleted(action)
        .map(() => new DuplicatesActions.DuplicatePagesPageUndeleted(action)));
}
