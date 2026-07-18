/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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

import { Component, inject, OnInit } from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ReadingList } from '@app/lists/models/reading-list';
import { selectUserReadingLists } from '@app/lists/selectors/reading-lists.selectors';
import { selectUser } from '@app/user/selectors/user.selectors';
import { getUserPreference, isAdmin } from '@app/user/user.functions';
import { TitleService } from '@app/core/services/title.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SHOW_COMIC_COVERS_PREFERENCE } from '@app/library/library.constants';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import { selectComicBookSelectionIds } from '@app/comic-books/selectors/comic-book-selection.selectors';
import { setMultipleComicBooksByTagTypeAndValueSelectionState } from '@app/comic-books/actions/comic-book-selection.actions';
import { setBusyState } from '@app/core/actions/busy.actions';
import { loadComicsForCollection } from '@app/comic-books/actions/comic-list.actions';
import {
  selectComicCoverMonths,
  selectComicCoverYears,
  selectComicFilteredCount,
  selectComicList,
  selectComicListState
} from '@app/comic-books/selectors/comic-list.selectors';
import { DisplayableComic } from '@app/comic-books/models/displayable-comic';
import {
  ComicTagType,
  comicTagTypeFromString
} from '@app/comic-books/models/comic-tag-type';
import { ComicListViewComponent } from '../../../comic-books/components/comic-list-view/comic-list-view.component';
import { tap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'cx-collection-detail',
  templateUrl: './collection-detail.component.html',
  styleUrls: ['./collection-detail.component.scss'],
  imports: [ComicListViewComponent, TranslateModule, AsyncPipe]
})
export class CollectionDetailComponent implements OnInit {
  comics$ = new BehaviorSubject<DisplayableComic[]>([]);
  totalComics$ = new BehaviorSubject(0);
  coverYears$ = new BehaviorSubject<number[]>([]);
  coverMonths$ = new BehaviorSubject<number[]>([]);

  routableTypeName: string;
  tagType: ComicTagType;
  tagValue: string;
  selectedIds$ = new BehaviorSubject<number[]>([]);
  lastReadDates$ = new BehaviorSubject<number[]>([]);
  readingLists$ = new BehaviorSubject<ReadingList[]>([]);
  isAdmin$ = new BehaviorSubject(false);
  showCovers$ = new BehaviorSubject(false);

  queryParameterService = inject(QueryParameterService);
  logger = inject(LoggerService);
  store = inject(Store);
  activatedRoute = inject(ActivatedRoute);
  router = inject(Router);
  translateService = inject(TranslateService);
  titleService = inject(TitleService);

  constructor() {
    this.activatedRoute.queryParams
      .pipe(tap(() => this.doLoadComicDetails()))
      .subscribe();
    this.activatedRoute.params
      .pipe(
        tap(params => {
          this.routableTypeName = params.collectionType;
          this.tagValue = params.collectionName;
          this.tagType = comicTagTypeFromString(this.routableTypeName);
          if (!this.tagType) {
            this.logger.error(
              'Invalid collection type:',
              params.collectionType
            );
            this.router.navigateByUrl('/library');
          } else {
            this.loadTranslations();
            this.doLoadComicDetails();
            this.store
              .select(selectComicListState)
              .pipe(
                tap(state =>
                  this.store.dispatch(setBusyState({ enabled: state.busy }))
                )
              )
              .subscribe();
            this.store
              .select(selectComicList)
              .pipe(tap(entries => this.comics$.next(entries)))
              .subscribe();
            this.store
              .select(selectComicFilteredCount)
              .pipe(tap(totalComics => this.totalComics$.next(totalComics)))
              .subscribe();
            this.store
              .select(selectComicCoverYears)
              .pipe(tap(coverYears => this.coverYears$.next(coverYears)))
              .subscribe();
            this.store
              .select(selectComicCoverMonths)
              .pipe(tap(coverMonths => this.coverMonths$.next(coverMonths)))
              .subscribe();
          }
        })
      )
      .subscribe();
    this.store
      .select(selectUser)
      .pipe(
        tap(user => {
          this.logger.trace('Setting isAdmin flag');
          this.isAdmin$.next(isAdmin(user));
          this.showCovers$.next(
            getUserPreference(
              user.preferences,
              SHOW_COMIC_COVERS_PREFERENCE,
              `${true}`
            ) === `${true}`
          );
        })
      )
      .subscribe();
    this.store
      .select(selectComicBookSelectionIds)
      .pipe(tap(selectedIds => this.selectedIds$.next(selectedIds)))
      .subscribe();
    this.store
      .select(selectUserReadingLists)
      .pipe(tap(lists => this.readingLists$.next(lists)))
      .subscribe();
    this.translateService.onLangChange
      .pipe(tap(() => this.loadTranslations()))
      .subscribe();
  }

  ngOnInit(): void {
    this.loadTranslations();
  }

  onSelectAll(selected: boolean): void {
    this.logger.debug(
      `Marking comic books as ${selected ? 'selected' : 'deselected'}`
    );
    this.store.dispatch(
      setMultipleComicBooksByTagTypeAndValueSelectionState({
        tagType: this.tagType,
        tagValue: this.tagValue,
        selected
      })
    );
  }

  private loadTranslations(): void {
    this.titleService.setTitle(
      this.translateService.instant('collection-detail.tab-title', {
        tagType: this.tagType,
        tagValue: this.tagValue
      })
    );
  }

  private doLoadComicDetails(): void {
    this.store.dispatch(
      loadComicsForCollection({
        pageSize: this.queryParameterService.pageSize$.value,
        pageIndex: this.queryParameterService.pageIndex$.value,
        tagType: this.tagType,
        tagValue: this.tagValue,
        sortBy: this.queryParameterService.sortBy$.value,
        sortDirection: this.queryParameterService.sortDirection$.value
      })
    );
  }
}
