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
import { Subscription } from 'rxjs';
import { Comic } from '@app/library';
import { LoggerService } from '@angular-ru/logger';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { loadComic } from '@app/library/actions/comic.actions';
import {
  selectComic,
  selectComicBusy
} from '@app/library/selectors/comic.selectors';
import { setBusyState } from '@app/core/actions/busy.actions';
import { selectUser } from '@app/user/selectors/user.selectors';
import { isAdmin } from '@app/user/user.functions';
import { updateQueryParam } from '@app/core';
import { QUERY_PARAM_TAB } from '@app/library/library.constants';

@Component({
  selector: 'cx-comic-details',
  templateUrl: './comic-details.component.html',
  styleUrls: ['./comic-details.component.scss']
})
export class ComicDetailsComponent implements OnInit, OnDestroy {
  paramSubscription: Subscription;
  queryParamSubscription: Subscription;
  currentTab = 0;
  comicBusySubscription: Subscription;
  comicSubscription: Subscription;
  comicId = -1;
  comic: Comic;
  userSubscription: Subscription;
  isAdmin = false;

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.paramSubscription = this.activatedRoute.params.subscribe(params => {
      this.comicId = +params.comicId;
      this.logger.debug('Found comic id parameter:', params.comicId);
      this.store.dispatch(loadComic({ id: this.comicId }));
    });
    this.queryParamSubscription = this.activatedRoute.queryParams.subscribe(
      params => {
        if (+params[QUERY_PARAM_TAB]) {
          this.currentTab = +params[QUERY_PARAM_TAB];
        }
      }
    );
    this.comicBusySubscription = this.store
      .select(selectComicBusy)
      .subscribe(busy => this.store.dispatch(setBusyState({ enabled: busy })));
    this.comicSubscription = this.store
      .select(selectComic)
      .subscribe(comic => (this.comic = comic));
    this.userSubscription = this.store
      .select(selectUser)
      .subscribe(user => (this.isAdmin = isAdmin(user)));
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.paramSubscription.unsubscribe();
    this.comicBusySubscription.unsubscribe();
    this.comicSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
  }

  onPreviousComic(): void {
    this.logger.trace('Loading previous comic:', this.comic.previousIssueId);
    this.routeToComic(this.comic.previousIssueId);
  }

  onNextComic(): void {
    this.logger.trace('Loading next comic:', this.comic.nextIssueId);
    this.routeToComic(this.comic.nextIssueId);
  }

  private routeToComic(id: number): void {
    this.router.navigate(['library', id], {
      queryParamsHandling: 'preserve'
    });
  }

  onTabChange(index: number): void {
    this.logger.trace('Changing active tab:', index);
    updateQueryParam(
      this.activatedRoute,
      this.router,
      QUERY_PARAM_TAB,
      `${index}`
    );
  }
}
