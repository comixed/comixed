/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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

import { Component, Input, OnDestroy } from '@angular/core';
import { User } from '@app/user/models/user';
import { isAdmin } from '@app/user/user.functions';
import { LoggerService } from '@angular-ru/cdk/logger';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectUserReadingLists } from '@app/lists/selectors/reading-lists.selectors';
import { ReadingList } from '@app/lists/models/reading-list';
import { selectLastReadEntries } from '@app/last-read/selectors/last-read-list.selectors';
import { LastRead } from '@app/last-read/models/last-read';
import { selectLibraryState } from '@app/library/selectors/library.selectors';
import { ComicBookState } from '@app/comic-books/models/comic-book-state';
import { LibraryState } from '@app/library/reducers/library.reducer';

@Component({
  selector: 'cx-side-navigation',
  templateUrl: './side-navigation.component.html',
  styleUrls: ['./side-navigation.component.scss']
})
export class SideNavigationComponent implements OnDestroy {
  isAdmin = false;
  comicsCollapsed = false;
  collectionCollapsed = false;
  readingListsCollapsed = false;
  libraryStateSubscription: Subscription;
  libraryState: LibraryState;
  lastReadSubscription: Subscription;
  lastRead: LastRead[] = [];
  totalComicBooks$ = new BehaviorSubject<number>(0);
  unprocessedComicBooks$ = new BehaviorSubject<number>(0);
  unreadComicBooks$ = new BehaviorSubject<number>(0);
  unscrapedComicBooks$ = new BehaviorSubject<number>(0);
  changedComicBooks$ = new BehaviorSubject<number>(0);
  deletedComicBooks$ = new BehaviorSubject<number>(0);
  duplicateComicBooks = new BehaviorSubject<number>(0);
  readingListsSubscription: Subscription;
  readingLists: ReadingList[] = [];

  constructor(private logger: LoggerService, private store: Store<any>) {
    this.libraryStateSubscription = this.store
      .select(selectLibraryState)
      .subscribe(state => {
        this.libraryState = state;
        this.totalComicBooks$.next(state.totalComics);
        this.unprocessedComicBooks$.next(
          this.getCountForState(state, ComicBookState.UNPROCESSED)
        );
        this.unreadComicBooks$.next(this.getUnreadComicCount());
        this.unscrapedComicBooks$.next(state.unscrapedComics);
        this.changedComicBooks$.next(
          this.getCountForState(state, ComicBookState.CHANGED)
        );
        this.deletedComicBooks$.next(state.deletedComics);
      });
    this.lastReadSubscription = this.store
      .select(selectLastReadEntries)
      .subscribe(entries => {
        this.lastRead = entries;
        this.unreadComicBooks$.next(this.getUnreadComicCount());
      });
    this.readingListsSubscription = this.store
      .select(selectUserReadingLists)
      .subscribe(lists => (this.readingLists = lists));
  }

  private _user = null;

  get user(): User {
    return this._user;
  }

  @Input() set user(user: User) {
    this.logger.debug('Setting user:', user);
    this._user = user;
    this.isAdmin = isAdmin(this.user);
  }

  ngOnDestroy(): void {
    this.logger.trace('Unsubscribing from comic list updates');
    this.libraryStateSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from last read updates');
    this.lastReadSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from reading list updates');
    this.readingListsSubscription.unsubscribe();
  }

  onCollapseComics(collapsed: boolean): void {
    this.comicsCollapsed = collapsed;
  }

  onCollapseCollection(collapsed: boolean): void {
    this.collectionCollapsed = collapsed;
  }

  onCollapseReadingLists(collapsed: boolean): void {
    this.readingListsCollapsed = collapsed;
  }

  private getUnreadComicCount(): number {
    /* istanbul ignore next */
    return this.libraryState?.totalComics - this.lastRead.length;
  }

  private getCountForState(
    libraryState: LibraryState,
    state: ComicBookState
  ): number {
    /* istanbul ignore next */
    const found = libraryState.states.find(entry => entry.name === state);
    /* istanbul ignore next */
    return !!found ? found.count : 0;
  }
}
