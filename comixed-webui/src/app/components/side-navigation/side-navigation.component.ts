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
import { selectComicBookListState } from '@app/comic-books/selectors/comic-book-list.selectors';
import { selectLastReadEntries } from '@app/last-read/selectors/last-read-list.selectors';
import { ComicBook } from '@app/comic-books/models/comic-book';
import { LastRead } from '@app/last-read/models/last-read';

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
  comicBookListStateSubscription: Subscription;
  allComicBooks: ComicBook[] = [];
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
    this.comicBookListStateSubscription = this.store
      .select(selectComicBookListState)
      .subscribe(state => {
        this.allComicBooks = state.comicBooks;
        this.totalComicBooks$.next(state.comicBooks.length);
        this.unprocessedComicBooks$.next(
          state.comicBooks.filter(comicBook => !comicBook.fileDetails).length
        );
        this.unreadComicBooks$.next(this.getUnreadComicCount());
        this.unscrapedComicBooks$.next(state.unscraped.length);
        this.changedComicBooks$.next(state.changed.length);
        this.deletedComicBooks$.next(state.deleted.length);
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
    this.comicBookListStateSubscription.unsubscribe();
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
    return this.allComicBooks.length - this.lastRead.length;
  }
}
