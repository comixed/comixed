/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import { Subscription } from 'rxjs';
import {
  selectDuplicateComicList,
  selectDuplicateComicState
} from '@app/library/selectors/duplicate-comic.selectors';
import { setBusyState } from '@app/core/actions/busy.actions';
import { loadDuplicateComics } from '@app/library/actions/duplicate-comic.actions';
import { ComicDetail } from '@app/comic-books/models/comic-detail';

@Component({
  selector: 'cx-duplicate-comics-page',
  templateUrl: './duplicate-comics-page.component.html',
  styleUrls: ['./duplicate-comics-page.component.scss']
})
export class DuplicateComicsPageComponent implements OnInit, OnDestroy {
  duplicateComicBookStateSubscription: Subscription;
  duplicateComicBookListSubscription: Subscription;
  comicBooks: ComicDetail[] = [];

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    public queryParameterService: QueryParameterService
  ) {
    this.logger.trace('Subscribing to duplicate comic book state updates');
    this.duplicateComicBookStateSubscription = this.store
      .select(selectDuplicateComicState)
      .subscribe(state =>
        this.store.dispatch(setBusyState({ enabled: state.busy }))
      );
    this.logger.trace('Subscribing to duplicate comic book list updates');
    this.duplicateComicBookListSubscription = this.store
      .select(selectDuplicateComicList)
      .subscribe(comicBooks => (this.comicBooks = comicBooks));
  }

  ngOnDestroy(): void {
    this.logger.trace('Unsubscribing from duplicate comic book state updates');
    this.duplicateComicBookStateSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from duplicate comic book list updates');
    this.duplicateComicBookListSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.logger.trace('Loading duplicate comic books');
    this.store.dispatch(loadDuplicateComics());
  }
}
