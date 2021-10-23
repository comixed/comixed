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

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { User } from '@app/user/models/user';
import { isAdmin } from '@app/user/user.functions';
import { LoggerService } from '@angular-ru/logger';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectUserReadingLists } from '@app/lists/selectors/reading-lists.selectors';
import { ReadingList } from '@app/lists/models/reading-list';
import { ActivatedRoute } from '@angular/router';
import { selectComicListState } from '@app/comic-books/selectors/comic-list.selectors';
import { selectLastReadEntries } from '@app/last-read/selectors/last-read-list.selectors';
import { Comic } from '@app/comic-books/models/comic';
import { LastRead } from '@app/last-read/models/last-read';

@Component({
  selector: 'cx-side-navigation',
  templateUrl: './side-navigation.component.html',
  styleUrls: ['./side-navigation.component.scss']
})
export class SideNavigationComponent implements OnInit, OnDestroy {
  isAdmin = false;
  comicsCollapsed = false;
  collectionCollapsed = false;
  readingListsCollapsed = false;
  comicListStateSubscription: Subscription;
  allComics: Comic[] = [];
  lastReadSubscription: Subscription;
  lastRead: LastRead[] = [];
  totalComics$ = new BehaviorSubject<number>(0);
  unreadComics$ = new BehaviorSubject<number>(0);
  unscrapedComics$ = new BehaviorSubject<number>(0);
  deletedComics$ = new BehaviorSubject<number>(0);
  duplicateComics = new BehaviorSubject<number>(0);
  readingListsSubscription: Subscription;
  readingLists: ReadingList[] = [];

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private activedRoute: ActivatedRoute
  ) {
    this.comicListStateSubscription = this.store
      .select(selectComicListState)
      .subscribe(state => {
        this.allComics = state.comics;
        this.totalComics$.next(state.comics.length);
        this.unreadComics$.next(this.getUnreadComicCount());
        this.unscrapedComics$.next(state.unscraped.length);
        this.deletedComics$.next(state.deleted.length);
      });
    this.lastReadSubscription = this.store
      .select(selectLastReadEntries)
      .subscribe(entries => {
        this.lastRead = entries;
        this.unreadComics$.next(this.getUnreadComicCount());
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
    this.comicListStateSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from last read updates');
    this.lastReadSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from reading list updates');
    this.readingListsSubscription.unsubscribe();
  }

  ngOnInit(): void {}

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
    return this.allComics.length - this.lastRead.length;
  }
}
