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
import { selectComicBookList } from '@app/comic-books/selectors/comic-book-list.selectors';
import { ReadingList } from '@app/lists/models/reading-list';
import { selectUserReadingLists } from '@app/lists/selectors/reading-lists.selectors';
import { selectUser } from '@app/user/selectors/user.selectors';
import { getUserPreference, isAdmin } from '@app/user/user.functions';
import { TitleService } from '@app/core/services/title.service';
import { TranslateService } from '@ngx-translate/core';
import { SHOW_COMIC_COVERS_PREFERENCE } from '@app/library/library.constants';
import { MISSING_VOLUME_PLACEHOLDER } from '@app/comic-books/comic-books.constants';
import {
  deselectComicBooks,
  selectComicBooks
} from '@app/library/actions/library-selections.actions';
import { selectLibrarySelections } from '@app/library/selectors/library-selections.selectors';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import { ComicDetail } from '@app/comic-books/models/comic-detail';
import { ComicTagType } from '@app/comic-books/models/comic-tag-type';

@Component({
  selector: 'cx-collection-detail',
  templateUrl: './collection-detail.component.html',
  styleUrls: ['./collection-detail.component.scss']
})
export class CollectionDetailComponent implements OnInit, OnDestroy {
  paramsSubscription: Subscription;
  comicSubscription: Subscription;
  routableTypeName: string;
  collectionType: CollectionType;
  collectionName: string;
  volume: string;
  volumeDisplayed: string;
  comicBooks: ComicDetail[] = [];
  selectedSubscription: Subscription;
  selectedIds: number[] = [];
  readingListsSubscription: Subscription;
  readingLists: ReadingList[] = [];
  userSubscription: Subscription;
  isAdmin = false;
  langChangeSubscription: Subscription;
  showCovers = false;

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private translateService: TranslateService,
    private titleService: TitleService,
    public urlParameterService: QueryParameterService
  ) {
    this.paramsSubscription = this.activatedRoute.params.subscribe(params => {
      this.routableTypeName = params.collectionType;
      this.collectionName = params.collectionName;
      this.volume = params.volume;
      this.volumeDisplayed = this.volume;
      if (this.volume === MISSING_VOLUME_PLACEHOLDER) {
        this.logger.trace('No actual volume used');
        this.volume = '';
      }
      this.collectionType = collectionTypeFromString(this.routableTypeName);
      if (!this.collectionType) {
        this.logger.error('Invalid collection type:', params.collectionType);
        this.router.navigateByUrl('/library');
      } else {
        this.loadTranslations();
        this.comicSubscription = this.store
          .select(selectComicBookList)
          .subscribe(entries => {
            this.comicBooks = entries.filter(comicBook => {
              switch (this.collectionType) {
                case CollectionType.PUBLISHERS:
                  return (
                    (comicBook.publisher || '[UNKNOWN]') === this.collectionName
                  );
                case CollectionType.SERIES:
                  return (
                    (comicBook.series || '[UNKNOWN]') === this.collectionName &&
                    (comicBook.volume || '') === this.volume
                  );
                case CollectionType.CHARACTERS:
                  return comicBook.tags
                    .filter(tag => tag.type === ComicTagType.CHARACTER)
                    .map(tag => tag.value)
                    .includes(this.collectionName);
                case CollectionType.TEAMS:
                  return comicBook.tags
                    .filter(tag => tag.type === ComicTagType.TEAM)
                    .map(tag => tag.value)
                    .includes(this.collectionName);
                case CollectionType.LOCATIONS:
                  return comicBook.tags
                    .filter(tag => tag.type === ComicTagType.LOCATION)
                    .map(tag => tag.value)
                    .includes(this.collectionName);
                case CollectionType.STORIES:
                  return comicBook.tags
                    .filter(tag => tag.type === ComicTagType.STORY)
                    .map(tag => tag.value)
                    .includes(this.collectionName);
              }
            });
          });
      }
    });
    this.userSubscription = this.store.select(selectUser).subscribe(user => {
      this.logger.trace('Setting isAdmin flag');
      this.isAdmin = isAdmin(user);
      this.showCovers =
        getUserPreference(
          user.preferences,
          SHOW_COMIC_COVERS_PREFERENCE,
          `${true}`
        ) === `${true}`;
    });
    this.selectedSubscription = this.store
      .select(selectLibrarySelections)
      .subscribe(selectedIds => (this.selectedIds = selectedIds));
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
    this.logger.trace('Unsubscribing from parameter events');
    this.paramsSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from comic updates');
    this.comicSubscription?.unsubscribe();
    this.logger.trace('Unsubscribing from user updates');
    this.userSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from reading list updates');
    this.readingListsSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from language change events');
    this.langChangeSubscription.unsubscribe();
  }

  onSelectAllComics(selected: boolean): void {
    if (selected) {
      this.logger.trace('Selecting all comics');
      this.store.dispatch(
        selectComicBooks({
          ids: this.comicBooks.map(comicBook => comicBook.comicId)
        })
      );
    } else {
      this.logger.trace('Deselecting all comics');
      this.store.dispatch(deselectComicBooks({ ids: this.selectedIds }));
    }
  }

  private loadTranslations(): void {
    this.titleService.setTitle(
      this.translateService.instant('collection-detail.tab-title', {
        collection: this.collectionType,
        name: this.collectionName,
        volume: this.volumeDisplayed
      })
    );
  }
}
