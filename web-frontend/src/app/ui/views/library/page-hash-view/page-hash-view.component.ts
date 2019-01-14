/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute, Params } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../app.state';
import * as DuplicatesActions from '../../../../actions/duplicate-pages.actions';
import { Duplicates } from '../../../../models/duplicates';
import { Comic } from '../../../../models/comics/comic';
import { Page } from '../../../../models/comics/page';
import { DUPLICATES_HASH_PARAMETER } from '../../../pages/library/duplicates-page/duplicates-page.component';

@Component({
  selector: 'app-page-hash-view',
  templateUrl: './page-hash-view.component.html',
  styleUrls: ['./page-hash-view.component.css']
})
export class PageHashViewComponent implements OnInit {
  @Input() duplicates: Duplicates;

  constructor(
    private store: Store<AppState>,
    private activated_route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit() {
  }

  close_page_view(): void {
    this.store.dispatch(new DuplicatesActions.DuplicatePagesShowAllPages());
    const queryParams: Params = Object.assign({}, this.activated_route.snapshot.queryParams);
    queryParams[DUPLICATES_HASH_PARAMETER] = null;
    this.router.navigate([], { relativeTo: this.activated_route, queryParams: queryParams });
  }

  delete_page(page: Page): void {
    this.store.dispatch(new DuplicatesActions.DuplicatePagesDeletePage({
      page: page,
    }));
  }

  undelete_page(page: Page): void {
    this.store.dispatch(new DuplicatesActions.DuplicatePagesUndeletePage({
      page: page,
    }));
  }
}
