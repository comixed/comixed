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
import { LoggerService } from '@angular-ru/logger';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import {
  CollectionType,
  collectionTypeFromString
} from '@app/collections/models/comic-collection.enum';
import { selectComicList } from '@app/comic-book/selectors/comic-list.selectors';
import { Comic } from '@app/comic-book/models/comic';
import { selectSelectedComics } from '@app/library/selectors/library.selectors';
import { ReadingList } from '@app/lists/models/reading-list';
import { selectUserReadingLists } from '@app/lists/selectors/reading-lists.selectors';
import { selectUser } from '@app/user/selectors/user.selectors';
import { isAdmin } from '@app/user/user.functions';

@Component({
  selector: 'cx-collection-detail',
  templateUrl: './collection-detail.component.html',
  styleUrls: ['./collection-detail.component.scss']
})
export class CollectionDetailComponent implements OnInit, OnDestroy {
  paramSubscription: Subscription;
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

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.paramSubscription = this.activatedRoute.params.subscribe(params => {
      this.routableTypeName = params.collectionType;
      this.collectionName = params.collectionName;
      this.collectionType = collectionTypeFromString(this.routableTypeName);
      if (!this.collectionType) {
        this.logger.error('Invalid collection type:', params.collectionType);
        this.router.navigateByUrl('/library');
      } else {
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
                  return comic.storyArcs.includes(this.collectionName);
              }
            });
          });
      }
    });
    this.userSubscription = this.store.select(selectUser).subscribe(user => {
      this.isAdmin = isAdmin(user);
    });
    this.selectedSubscription = this.store
      .select(selectSelectedComics)
      .subscribe(selected => (this.selected = selected));
    this.readingListsSubscription = this.store
      .select(selectUserReadingLists)
      .subscribe(lists => (this.readingLists = lists));
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.logger.trace('Unsubscribing from parameter updates');
    this.paramSubscription.unsubscribe();
    if (!!this.comicSubscription) {
      this.comicSubscription.unsubscribe();
    }
    this.logger.trace('Unsubscribing from user updates');
    this.userSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from reading list updats');
    this.readingListsSubscription.unsubscribe();
  }
}
