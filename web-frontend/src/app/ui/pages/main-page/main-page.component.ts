/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project
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
import { Store } from '@ngrx/store';
import { Observable ,  Subscription } from 'rxjs';
import { AppState } from '../../../app.state';
import { Library } from '../../../models/library';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})
export class MainPageComponent implements OnInit, OnDestroy {
  private library$: Observable<Library>;
  private library_subscription: Subscription;
  private library: Library;

  public comic_count: number;
  public plural = false;

  constructor(
    private store: Store<AppState>,
  ) {
    this.library$ = store.select('library');
  }

  ngOnInit() {
    this.library_subscription = this.library$.subscribe(
      (library: Library) => {
        this.comic_count = library.comics.length;
        this.plural = this.comic_count !== 1;
      });
  }

  ngOnDestroy() {
    this.library_subscription.unsubscribe();
  }
}
