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

import { Component, inject, Input } from '@angular/core';
import { User } from '@app/user/models/user';
import { isAdmin } from '@app/user/user.functions';
import { LoggerService } from '@angular-ru/cdk/logger';
import { BehaviorSubject } from 'rxjs';
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
import { tap } from 'rxjs/operators';

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
    TranslateModule
  ]
})
export class SideNavigationComponent {
  isAdmin$ = new BehaviorSubject(false);
  blockedPagesEnabled$ = new BehaviorSubject(false);
  comicsCollapsed$ = new BehaviorSubject(false);
  collectionCollapsed$ = new BehaviorSubject(false);
  readingListsCollapsed$ = new BehaviorSubject(false);
  totalComicBooks$ = new BehaviorSubject<number>(0);
  selectedComicBooks$ = new BehaviorSubject<number>(0);
  unprocessedComicBooks$ = new BehaviorSubject<number>(0);
  readComicBooks$ = new BehaviorSubject<number>(0);
  unscrapedComicBooks$ = new BehaviorSubject<number>(0);
  changedComicBooks$ = new BehaviorSubject<number>(0);
  deletedComicBooks$ = new BehaviorSubject<number>(0);
  duplicateComicBooks$ = new BehaviorSubject<number>(0);
  readingLists: ReadingList[] = [];

  logger = inject(LoggerService);
  store = inject(Store);

  constructor() {
    this.store
      .select(selectFeatureEnabledState)
      .pipe(
        tap(state => {
          if (
            !state.busy &&
            !hasFeature(state.features, BLOCKED_PAGES_ENABLED)
          ) {
            this.logger.debug('Loading feature state:', BLOCKED_PAGES_ENABLED);
            this.store.dispatch(
              getFeatureEnabled({ name: BLOCKED_PAGES_ENABLED })
            );
          } else {
            this.blockedPagesEnabled$.next(
              isFeatureEnabled(state.features, BLOCKED_PAGES_ENABLED)
            );
          }
        })
      )
      .subscribe();
    this.store
      .select(selectLibraryState)
      .pipe(
        tap(state => {
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
        })
      )
      .subscribe();
    this.store
      .select(selectReadComicBooksList)
      .pipe(
        tap(comicBooksRead => this.readComicBooks$.next(comicBooksRead.length))
      )
      .subscribe();
    this.store
      .select(selectComicBookSelectionState)
      .pipe(tap(state => this.selectedComicBooks$.next(state.ids.length)))
      .subscribe();
    this.store
      .select(selectUserReadingLists)
      .pipe(tap(lists => (this.readingLists = lists)))
      .subscribe();
  }

  private _user = null;

  get user(): User {
    return this._user;
  }

  @Input() set user(user: User) {
    this.logger.debug('Setting user:', user);
    this._user = user;
    this.isAdmin$.next(isAdmin(this.user));
  }

  onCollapseComics(collapsed: boolean): void {
    this.comicsCollapsed$.next(collapsed);
  }

  onCollapseCollection(collapsed: boolean): void {
    this.collectionCollapsed$.next(collapsed);
  }

  onCollapseReadingLists(collapsed: boolean): void {
    this.readingListsCollapsed$.next(collapsed);
  }

  private getCountForState(
    libraryState: LibraryState,
    state: ComicState
  ): number {
    /* istanbul ignore next */
    const found = libraryState.states.find(entry => entry.name === state);
    /* istanbul ignore next */
    return found?.count || 0;
  }
}
