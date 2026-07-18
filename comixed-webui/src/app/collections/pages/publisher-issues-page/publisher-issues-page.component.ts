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
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { setBusyState } from '@app/core/actions/busy.actions';
import { setMultipleComicBookByPublisherSelectionState } from '@app/comic-books/actions/comic-book-selection.actions';
import { selectComicBookSelectionIds } from '@app/comic-books/selectors/comic-book-selection.selectors';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TitleService } from '@app/core/services/title.service';
import { selectUser } from '@app/user/selectors/user.selectors';
import { isAdmin } from '@app/user/user.functions';
import { loadComicsByFilter } from '@app/comic-books/actions/comic-list.actions';
import {
  selectComicFilteredCount,
  selectComicList,
  selectComicListBusy
} from '@app/comic-books/selectors/comic-list.selectors';
import { DisplayableComic } from '@app/comic-books/models/displayable-comic';
import { ComicListViewComponent } from '../../../comic-books/components/comic-list-view/comic-list-view.component';
import { tap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'cx-publisher-issues-page',
  templateUrl: './publisher-issues-page.component.html',
  styleUrl: './publisher-issues-page.component.scss',
  imports: [ComicListViewComponent, TranslateModule, AsyncPipe]
})
export class PublisherIssuesPageComponent implements OnInit {
  name$ = new BehaviorSubject('');
  isAdmin$ = new BehaviorSubject(false);
  comics$ = new BehaviorSubject<DisplayableComic[]>([]);
  totalComics$ = new BehaviorSubject(0);
  selectedIds$ = new BehaviorSubject<number[]>([]);

  queryParameterService = inject(QueryParameterService);
  logger = inject(LoggerService);
  store = inject(Store);
  activatedRoute = inject(ActivatedRoute);
  translateService = inject(TranslateService);
  titleService = inject(TitleService);

  constructor() {
    this.store
      .select(selectComicListBusy)
      .pipe(
        tap(enabled => {
          this.store.dispatch(setBusyState({ enabled }));
        })
      )
      .subscribe();
    this.translateService.onLangChange
      .pipe(tap(() => this.loadTranslations()))
      .subscribe();
    this.activatedRoute.params
      .pipe(
        tap(params => {
          this.name$.next(params['name']);
          this.doLoadComicDetails();
        })
      )
      .subscribe();
    this.activatedRoute.queryParams
      .pipe(tap(params => this.doLoadComicDetails()))
      .subscribe();
    this.store
      .select(selectComicList)
      .pipe(tap(comics => this.comics$.next(comics)))
      .subscribe();
    this.store
      .select(selectComicFilteredCount)
      .pipe(tap(totalComics => this.totalComics$.next(totalComics)))
      .subscribe();
    this.store
      .select(selectComicBookSelectionIds)
      .pipe(tap(selectedIds => this.selectedIds$.next(selectedIds)))
      .subscribe();
    this.store
      .select(selectUser)
      .pipe(tap(user => this.isAdmin$.next(isAdmin(user))))
      .subscribe();
  }

  ngOnInit(): void {
    this.loadTranslations();
  }

  onSelectAll(selected: boolean): void {
    this.logger.debug('Setting all comic books selected state:', selected);
    this.store.dispatch(
      setMultipleComicBookByPublisherSelectionState({
        publisher: this.name$.value,
        selected
      })
    );
  }

  private doLoadComicDetails() {
    this.store.dispatch(
      loadComicsByFilter({
        pageSize: this.queryParameterService.pageSize$.value,
        pageIndex: this.queryParameterService.pageIndex$.value,
        sortBy: this.queryParameterService.sortBy$.value,
        sortDirection: this.queryParameterService.sortDirection$.value,
        coverYear: this.queryParameterService.coverYear$.value?.year,
        coverMonth: this.queryParameterService.coverYear$.value?.month,
        archiveType: this.queryParameterService.archiveType$.value,
        comicType: this.queryParameterService.comicType$.value,
        comicState: null,
        selected: false,
        missing: false,
        unscrapedState: false,
        searchText: null,
        publisher: this.name$.value,
        series: null,
        volume: null,
        pageCount: null
      })
    );
  }

  private loadTranslations(): void {
    this.titleService.setTitle(
      this.translateService.instant(
        'collections.publishers.list-issues-page.tab-title',
        { publisher: this.name$.value }
      )
    );
  }
}
