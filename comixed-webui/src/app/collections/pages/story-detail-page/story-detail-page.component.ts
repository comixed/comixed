/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2025, The ComiXed Project
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
import { DisplayableComic } from '@app/comic-books/models/displayable-comic';
import { ReadingList } from '@app/lists/models/reading-list';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TitleService } from '@app/core/services/title.service';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import {
  selectComicCoverMonths,
  selectComicCoverYears,
  selectComicFilteredCount,
  selectComicList,
  selectComicListState
} from '@app/comic-books/selectors/comic-list.selectors';
import { setBusyState } from '@app/core/actions/busy.actions';
import { selectUser } from '@app/user/selectors/user.selectors';
import { getUserPreference } from '@app/user';
import { SHOW_COMIC_COVERS_PREFERENCE } from '@app/library/library.constants';
import { selectComicBookSelectionIds } from '@app/comic-books/selectors/comic-book-selection.selectors';
import { selectUserReadingLists } from '@app/lists/selectors/reading-lists.selectors';
import { setMultipleComicBooksByTagTypeAndValueSelectionState } from '@app/comic-books/actions/comic-book-selection.actions';
import { loadComicsForCollection } from '@app/comic-books/actions/comic-list.actions';
import { ComicTagType } from '@app/comic-books/models/comic-tag-type';
import { isAdmin } from '@app/user/user.functions';
import { SCRAPE_STORY_PARAMETER } from '@app/collections/collections.constants';
import { MatFabButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { ComicListViewComponent } from '../../../comic-books/components/comic-list-view/comic-list-view.component';
import { StoryScrapingComponent } from '../../components/story-scraping/story-scraping.component';
import { tap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { selectReadComicBooksList } from '@app/user/selectors/read-comic-books.selectors';

@Component({
  selector: 'cx-story-detail',
  templateUrl: './story-detail-page.component.html',
  styleUrl: './story-detail-page.component.scss',
  imports: [
    MatFabButton,
    MatTooltip,
    MatIcon,
    ComicListViewComponent,
    StoryScrapingComponent,
    TranslateModule,
    AsyncPipe
  ]
})
export class StoryDetailPageComponent implements OnInit {
  comics$ = new BehaviorSubject<DisplayableComic[]>([]);
  totalComics$ = new BehaviorSubject(0);
  coverYears$ = new BehaviorSubject<number[]>([]);
  coverMonths$ = new BehaviorSubject<number[]>([]);
  storyName$ = new BehaviorSubject('');
  selectedIds$ = new BehaviorSubject<number[]>([]);
  readComicBookList$ = new BehaviorSubject<number[]>([]);
  readingLists$ = new BehaviorSubject<ReadingList[]>([]);
  isAdmin$ = new BehaviorSubject(false);
  showStoryScraping$ = new BehaviorSubject(false);
  showCovers$ = new BehaviorSubject(false);

  logger = inject(LoggerService);
  store = inject(Store);
  activatedRoute = inject(ActivatedRoute);
  translateService = inject(TranslateService);
  titleService = inject(TitleService);
  queryParameterService = inject(QueryParameterService);

  constructor() {
    this.activatedRoute.queryParams
      .pipe(
        tap(params => {
          this.doLoadComicDetails();
          this.showStoryScraping$.next(
            params[SCRAPE_STORY_PARAMETER] === `${true}`
          );
        })
      )
      .subscribe();
    this.activatedRoute.params
      .pipe(
        tap(params => {
          this.storyName$.next(params.storyName);
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
      .select(selectReadComicBooksList)
      .pipe(
        tap(readComicBookList =>
          this.readComicBookList$.next(readComicBookList)
        )
      )
      .subscribe();
    this.store
      .select(selectUserReadingLists)
      .pipe(tap(lists => this.readingLists$.next(lists)))
      .subscribe();
    this.translateService.onLangChange
      .pipe(tap(() => this.loadTranslations()))
      .subscribe();
  }

  get showScrapingButton(): boolean {
    return !this.showStoryScraping$.value && this.isAdmin$.value;
  }

  ngOnInit(): void {
    this.loadTranslations();
  }

  onSelectAll(selected: boolean): void {
    /* istanbul ignore next */
    this.logger.debug(
      `Marking comic books as ${selected ? 'selected' : 'deselected'}`
    );
    this.store.dispatch(
      setMultipleComicBooksByTagTypeAndValueSelectionState({
        tagType: ComicTagType.STORY,
        tagValue: this.storyName$.value,
        selected
      })
    );
  }

  onShowStoryScraping(): void {
    this.queryParameterService.updateQueryParam([
      { name: SCRAPE_STORY_PARAMETER, value: `${true}` }
    ]);
  }

  private loadTranslations(): void {
    this.titleService.setTitle(
      this.translateService.instant('story-detail.tab-title', {
        tagValue: this.storyName$.value
      })
    );
  }

  private doLoadComicDetails(): void {
    this.store.dispatch(
      loadComicsForCollection({
        pageSize: this.queryParameterService.pageSize$.value,
        pageIndex: this.queryParameterService.pageIndex$.value,
        tagType: ComicTagType.STORY,
        tagValue: this.storyName$.value,
        sortBy: this.queryParameterService.sortBy$.value,
        sortDirection: this.queryParameterService.sortDirection$.value
      })
    );
  }
}
