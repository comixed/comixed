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
import { AppState } from 'app/app.state';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Library } from 'app/models/actions/library';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Comic } from 'app/models/comics/comic';
import { LibraryDisplay } from 'app/models/state/library-display';

@Component({
  selector: 'app-missing-comics-page',
  templateUrl: './missing-comics-page.component.html',
  styleUrls: ['./missing-comics-page.component.css']
})
export class MissingComicsPageComponent implements OnInit, OnDestroy {
  private library$: Observable<Library>;
  private library_subscription: Subscription;
  library: Library;

  private library_display$: Observable<LibraryDisplay>;
  private library_display_subscription: Subscription;
  library_display: LibraryDisplay;

  comics: Array<Comic> = [];
  selected_comics: Array<Comic> = [];

  constructor(
    private store: Store<AppState>,
    private translate: TranslateService
  ) {
    this.library$ = store.select('library');
    this.library_display$ = store.select('library_display');
  }

  ngOnInit() {
    this.library_subscription = this.library$.subscribe((library: Library) => {
      this.library = library;

      if (this.library) {
        this.comics = [].concat(this.library.comics);
        this.selected_comics = [].concat(this.library.selected_comics);
      }
    });
    this.library_display_subscription = this.library_display$.subscribe(
      (library_display: LibraryDisplay) => {
        this.library_display = library_display;
      }
    );
  }

  ngOnDestroy(): void {
    this.library_subscription.unsubscribe();
    this.library_display_subscription.unsubscribe();
  }
}
