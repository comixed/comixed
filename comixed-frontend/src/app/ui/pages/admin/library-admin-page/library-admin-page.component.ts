/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { LibraryState } from 'app/models/state/library-state';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { AppState } from 'app/app.state';
import * as LibraryActions from 'app/actions/library.actions';

@Component({
  selector: 'app-library-admin-page',
  templateUrl: './library-admin-page.component.html',
  styleUrls: ['./library-admin-page.component.css']
})
export class LibraryAdminPageComponent implements OnInit, OnDestroy {
  library$: Observable<LibraryState>;
  library_subscription: Subscription;
  library: LibraryState;

  constructor(private store: Store<AppState>) {
    this.library$ = store.select('library');
  }

  ngOnInit() {
    this.library_subscription = this.library$.subscribe(
      (library: LibraryState) => {
        this.library = library;
      }
    );
  }

  ngOnDestroy() {
    this.library_subscription.unsubscribe();
  }

  rescan_library(): void {
    if (this.library.library_contents.rescan_count === 0) {
      this.store.dispatch(
        new LibraryActions.LibraryRescanFiles({
          last_comic_date: '0',
          timeout: 60000
        })
      );
    }
  }
}
