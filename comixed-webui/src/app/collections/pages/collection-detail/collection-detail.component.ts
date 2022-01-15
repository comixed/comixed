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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { LoggerService } from '@angular-ru/cdk/logger';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import {
  CollectionType,
  collectionTypeFromString
} from '@app/collections/models/comic-collection.enum';
import { selectComicList } from '@app/comic-books/selectors/comic-list.selectors';
import { Comic } from '@app/comic-books/models/comic';
import { selectSelectedComics } from '@app/library/selectors/library.selectors';
import { ReadingList } from '@app/lists/models/reading-list';
import { selectUserReadingLists } from '@app/lists/selectors/reading-lists.selectors';
import { selectUser } from '@app/user/selectors/user.selectors';
import { getPageSize, isAdmin } from '@app/user/user.functions';
import { TitleService } from '@app/core/services/title.service';
import { TranslateService } from '@ngx-translate/core';
import {
  PAGE_SIZE_DEFAULT,
  QUERY_PARAM_PAGE_INDEX
} from '@app/library/library.constants';
import { updateQueryParam } from '@app/core';

@Component({
  selector: 'cx-collection-detail',
  templateUrl: './collection-detail.component.html',
  styleUrls: ['./collection-detail.component.scss']
})
export class CollectionDetailComponent implements OnInit, OnDestroy {
  paramsSubscription: Subscription;
  queryParamsSubscribe: Subscription;
  comicSubscription: Subscription;
  routableTypeName: string;
  collectionType: CollectionType;
  collectionName: string;
  comics: Comic[] = [];
  selectedSubscription: Subscription;
  selected: Comic[] = [];
  readingListsSubscription: Subscription;
  readingLists: ReadingList[] = [];
  userSubscription: Subscription;
  isAdmin = false;
  pageSize = PAGE_SIZE_DEFAULT;
  pageIndex = 0;
  langChangeSubscription: Subscription;

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private translateService: TranslateService,
    private titleService: TitleService
  ) {
    this.paramsSubscription = this.activatedRoute.params.subscribe(params => {
      this.routableTypeName = params.collectionType;
      this.collectionName = params.collectionName;
      this.collectionType = collectionTypeFromString(this.routableTypeName);
      if (!this.collectionType) {
        this.logger.error('Invalid collection type:', params.collectionType);
        this.router.navigateByUrl('/library');
      } else {
        this.loadTranslations();
        this.comicSubscription = this.store
          .select(selectComicList)
          .subscribe(entries => {
            this.comics = entries.filter(comic => {
              switch (this.collectionType) {
                case CollectionType.PUBLISHERS:
                  return comic.publisher === this.collectionName;
                case CollectionType.SERIES:
                  return comic.series === this.collectionName;
                case CollectionType.CHARACTERS:
                  return comic.characters.includes(this.collectionName);
                case CollectionType.TEAMS:
                  return comic.teams.includes(this.collectionName);
                case CollectionType.LOCATIONS:
                  return comic.locations.includes(this.collectionName);
                case CollectionType.STORIES:
                  return comic.stories.includes(this.collectionName);
              }
            });
          });
      }
    });
    this.queryParamsSubscribe = this.activatedRoute.queryParams.subscribe(
      params => {
        if (!!params[QUERY_PARAM_PAGE_INDEX]) {
          this.pageIndex = +params[QUERY_PARAM_PAGE_INDEX];
          this.logger.debug(`Page index: ${this.pageIndex}`);
        }
      }
    );
    this.userSubscription = this.store.select(selectUser).subscribe(user => {
      this.logger.trace('Setting isAdmin flag');
      this.isAdmin = isAdmin(user);
      this.logger.trace('Loading user page size preference');
      this.pageSize = getPageSize(user);
    });
    this.selectedSubscription = this.store
      .select(selectSelectedComics)
      .subscribe(selected => (this.selected = selected));
    this.readingListsSubscription = this.store
      .select(selectUserReadingLists)
      .subscribe(lists => (this.readingLists = lists));
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
  }

  ngOnInit(): void {
    this.loadTranslations();
  }

  ngOnDestroy(): void {
    this.logger.trace('Unsubscribing from parameter updates');
    this.paramsSubscription.unsubscribe();
    this.queryParamsSubscribe.unsubscribe();
    if (!!this.comicSubscription) {
      this.comicSubscription.unsubscribe();
    }
    this.logger.trace('Unsubscribing from user updates');
    this.userSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from reading list updats');
    this.readingListsSubscription.unsubscribe();
    this.langChangeSubscription.unsubscribe();
  }

  onPageIndexChanged(pageIndex: number): void {
    this.logger.debug('Page index changed:', pageIndex);
    updateQueryParam(
      this.activatedRoute,
      this.router,
      QUERY_PARAM_PAGE_INDEX,
      `${pageIndex}`
    );
  }

  private loadTranslations(): void {
    this.titleService.setTitle(
      this.translateService.instant('collection-detail.tab-title', {
        collection: this.collectionType,
        name: this.collectionName
      })
    );
  }
}
