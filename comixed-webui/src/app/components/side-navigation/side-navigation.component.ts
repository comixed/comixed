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

import { Component, inject, Input, OnDestroy } from '@angular/core';
import { User } from '@app/user/models/user';
import { isAdmin } from '@app/user/user.functions';
import { LoggerService } from '@angular-ru/cdk/logger';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectUserReadingLists } from '@app/lists/selectors/reading-lists.selectors';
import { ReadingList } from '@app/lists/models/reading-list';
import { selectLibraryState } from '@app/library/selectors/library.selectors';
import { ComicState } from '@app/comic-books/models/comic-state';
import { LibraryState } from '@app/library/reducers/library.reducer';
import { selectFeatureEnabledState } from '@app/admin/selectors/feature-enabled.selectors';
import { BLOCKED_PAGES_ENABLED } from '@app/admin/admin.constants';
import { getFeatureEnabled } from '@app/admin/actions/feature-enabled.actions';
import { hasFeature, isFeatureEnabled } from '@app/admin';
import { selectReadComicBooksList } from '@app/user/selectors/read-comic-books.selectors';
import { selectComicBookSelectionState } from '@app/comic-books/selectors/comic-book-selection.selectors';
import { MatButton } from '@angular/material/button';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatLabel } from '@angular/material/form-field';
import { MatDivider } from '@angular/material/divider';
import { AsyncPipe, DecimalPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatBadge } from '@angular/material/badge';

@Component({
  selector: 'cx-side-navigation',
  templateUrl: './side-navigation.component.html',
  styleUrls: ['./side-navigation.component.scss'],
  imports: [
    MatButton,
    RouterLink,
    RouterLinkActive,
    MatIcon,
    MatLabel,
    MatDivider,
    AsyncPipe,
    DecimalPipe,
    TranslateModule,
    MatBadge
  ]
})
export class SideNavigationComponent implements OnDestroy {
  isAdmin = false;
  blockedPagesEnabled = false;
  featureEnabledSubscription$: Subscription;
  comicsCollapsed = false;
  collectionCollapsed = false;
  readingListsCollapsed = false;
  libraryStateSubscription$: Subscription;
  libraryState: LibraryState;
  lastReadUnreadCountSubscription$: Subscription;
  selectedComicsSubscription$: Subscription;
  totalComicBooks$ = new BehaviorSubject<number>(0);
  selectedComicBooks$ = new BehaviorSubject<number>(0);
  unprocessedComicBooks$ = new BehaviorSubject<number>(0);
  readComicBooks$ = new BehaviorSubject<number>(0);
  unscrapedComicBooks$ = new BehaviorSubject<number>(0);
  changedComicBooks$ = new BehaviorSubject<number>(0);
  deletedComicBooks$ = new BehaviorSubject<number>(0);
  duplicateComicBooks$ = new BehaviorSubject<number>(0);
  readingListsSubscription$: Subscription;
  readingLists: ReadingList[] = [];

  logger = inject(LoggerService);
  store = inject(Store);

  constructor() {
    this.featureEnabledSubscription$ = this.store
      .select(selectFeatureEnabledState)
      .subscribe(state => {
        if (!state.busy && !hasFeature(state.features, BLOCKED_PAGES_ENABLED)) {
          this.logger.debug('Loading feature state:', BLOCKED_PAGES_ENABLED);
          this.store.dispatch(
            getFeatureEnabled({ name: BLOCKED_PAGES_ENABLED })
          );
        } else {
          this.blockedPagesEnabled = isFeatureEnabled(
            state.features,
            BLOCKED_PAGES_ENABLED
          );
        }
      });
    this.libraryStateSubscription$ = this.store
      .select(selectLibraryState)
      .subscribe(state => {
        this.libraryState = state;
        this.totalComicBooks$.next(state.totalComics);
        this.unprocessedComicBooks$.next(
          this.getCountForState(state, ComicState.UNPROCESSED)
        );
        this.unscrapedComicBooks$.next(state.unscrapedComics);
        this.changedComicBooks$.next(
          this.getCountForState(state, ComicState.CHANGED)
        );
        this.deletedComicBooks$.next(state.deletedComics);
        this.duplicateComicBooks$.next(state.duplicateComics);
      });
    this.lastReadUnreadCountSubscription$ = this.store
      .select(selectReadComicBooksList)
      .subscribe(comicBooksRead =>
        this.readComicBooks$.next(comicBooksRead.length)
      );
    this.selectedComicsSubscription$ = this.store
      .select(selectComicBookSelectionState)
      .subscribe(state => this.selectedComicBooks$.next(state.ids.length));
    this.readingListsSubscription$ = this.store
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
    this.libraryStateSubscription$.unsubscribe();
    this.logger.trace('Unsubscribing from unread count updates');
    this.lastReadUnreadCountSubscription$.unsubscribe();
    this.logger.trace('Unsubscribing from reading list updates');
    this.readingListsSubscription$.unsubscribe();
    this.logger.trace('Unsubscribing from selected comic book updates');
    this.selectedComicsSubscription$.unsubscribe();
    this.logger.trace('Unsubscribing from feature enabled updates');
    this.featureEnabledSubscription$.unsubscribe();
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

  private getCountForState(
    libraryState: LibraryState,
    state: ComicState
  ): number {
    /* istanbul ignore next */
    const found = libraryState.states.find(entry => entry.name === state);
    /* istanbul ignore next */
    return !!found ? found.count : 0;
  }
}
