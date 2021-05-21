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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { LoggerService } from '@angular-ru/logger';
import { Subscription } from 'rxjs';
import { Comic } from '@app/comic-book/models/comic';
import {
  selectAllComics,
  selectSelectedComics
} from '@app/library/selectors/library.selectors';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from '@app/core/services/alert.service';
import {
  CHARACTERS_GROUP,
  LOCATIONS_GROUP,
  PUBLISHERS_GROUP,
  SERIES_GROUP,
  STORIES_GROUP,
  TEAMS_GROUP
} from '@app/library/library.constants';

@Component({
  selector: 'cx-comic-group',
  templateUrl: './library-group.component.html',
  styleUrls: ['./library-group.component.scss']
})
export class LibraryGroupComponent implements OnInit, OnDestroy {
  typeSubscription: Subscription;
  paramSubscription: Subscription;
  comicSubscription: Subscription;
  comics: Comic[] = [];
  selectedSubscription: Subscription;
  selected: Comic[] = [];
  groupType: string;
  groupName: string;

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {
    this.paramSubscription = this.activatedRoute.params.subscribe(params => {
      this.groupType = params.type;
      this.groupName = params.name;
      if (
        ![
          PUBLISHERS_GROUP,
          SERIES_GROUP,
          CHARACTERS_GROUP,
          TEAMS_GROUP,
          LOCATIONS_GROUP,
          STORIES_GROUP
        ].includes(this.groupType)
      ) {
        this.logger.debug('Invalid group:', this.groupType);
        this.alertService.error(
          this.translateService.instant(
            'library.comic-group.invalid-grouping',
            { name: this.groupType }
          )
        );
        this.router.navigateByUrl('/library/all');
      } else {
        this.subscribeToUpdates();
      }
    });
    this.selectedSubscription = this.store
      .select(selectSelectedComics)
      .subscribe(selected => (this.selected = selected));
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    if (!!this.comicSubscription) {
      this.comicSubscription.unsubscribe();
    }
  }

  private subscribeToUpdates(): void {
    if (!!this.comicSubscription) {
      this.comicSubscription.unsubscribe();
      this.comicSubscription = null;
    }
    this.comicSubscription = this.store
      .select(selectAllComics)
      .subscribe(comics => {
        let values: string[];
        this.logger.debug(
          'Filtering comics by',
          this.groupType,
          'of',
          this.groupName
        );
        this.comics = comics.filter(comic => {
          switch (this.groupType) {
            case PUBLISHERS_GROUP:
              values = [comic.publisher || ''];
              break;
            case SERIES_GROUP:
              values = [comic.series || ''];
              break;
            case CHARACTERS_GROUP:
              values = comic.characters;
              break;
            case TEAMS_GROUP:
              values = comic.teams;
              break;
            case LOCATIONS_GROUP:
              values = comic.locations;
              break;
            case STORIES_GROUP:
              values = comic.storyArcs;
              break;
          }
          this.logger.debug('values:', values);
          return values
            .map(value => value.toUpperCase())
            .includes(this.groupName.toUpperCase());
        });
      });
  }
}
