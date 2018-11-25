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

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute, Params } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { AppState } from '../../../../app.state';
import * as DuplicatesActions from '../../../../actions/duplicate-pages.actions';
import { AlertService } from '../../../../services/alert.service';
import { Duplicates } from '../../../../models/duplicates';

export const DUPLICATES_HASH_PARAMETER = 'hash';

@Component({
  selector: 'app-duplicates-page',
  templateUrl: './duplicates-page.component.html',
  styleUrls: ['./duplicates-page.component.css']
})
export class DuplicatesPageComponent implements OnInit, OnDestroy {
  duplicates$: Observable<Duplicates>;
  duplicates_subscription; Subscription;
  duplicates: Duplicates;

  constructor(
    private activated_route: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>,
    private alert_service: AlertService,
  ) {
    this.duplicates$ = store.select('duplicates');
  }

  ngOnInit() {
    this.duplicates_subscription = this.duplicates$.subscribe(
      (duplicates: Duplicates) => {
        this.duplicates = duplicates;

        if (this.duplicates.pages_deleted > 0) {
          this.alert_service.show_info_message(`Marked ${this.duplicates.pages_deleted} page(s) for deletion...`);
        }
        if (this.duplicates.pages_undeleted) {
          this.alert_service.show_info_message(`${this.duplicates.pages_undeleted} page(s) unmarked...`);
        }
        if (this.duplicates.current_hash && !this.duplicates.current_duplicates && this.duplicates.pages.length > 0) {
          this.store.dispatch(new DuplicatesActions.DuplicatePagesShowComicsWithHash(this.duplicates.current_hash));
        }
      });
    this.activated_route.queryParams.subscribe(params => {
      if (params[DUPLICATES_HASH_PARAMETER]) {
        this.store.dispatch(new DuplicatesActions.DuplicatePagesShowComicsWithHash(params[DUPLICATES_HASH_PARAMETER]));
      }
    });
    this.store.dispatch(new DuplicatesActions.DuplicatePagesFetchPages());
  }

  ngOnDestroy() {
    this.duplicates_subscription.unsubscribe();
  }
}
