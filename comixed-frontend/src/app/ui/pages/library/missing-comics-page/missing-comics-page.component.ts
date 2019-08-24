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
import { Subscription } from 'rxjs';
import { Comic, LibraryAdaptor, SelectionAdaptor } from 'app/library';

@Component({
  selector: 'app-missing-comics-page',
  templateUrl: './missing-comics-page.component.html',
  styleUrls: ['./missing-comics-page.component.css']
})
export class MissingComicsPageComponent implements OnInit, OnDestroy {
  comics_subscription: Subscription;
  comics: Comic[] = [];
  selected_comics_subscription: Subscription;
  selected_comics: Comic[] = [];

  constructor(
    private library_adaptor: LibraryAdaptor,
    private selection_adaptor: SelectionAdaptor
  ) {}

  ngOnInit() {
    this.comics_subscription = this.library_adaptor.comic$.subscribe(
      comics => (this.comics = comics)
    );
    this.selected_comics_subscription = this.selection_adaptor.comic_selection$.subscribe(
      selected_comics => (this.selected_comics = selected_comics)
    );
  }

  ngOnDestroy(): void {
    this.comics_subscription.unsubscribe();
    this.selected_comics_subscription.unsubscribe();
  }
}
