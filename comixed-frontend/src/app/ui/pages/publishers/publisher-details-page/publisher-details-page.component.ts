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
import { Comic, LibraryAdaptor, SelectionAdaptor } from 'app/library';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-publisher-details-page',
  templateUrl: './publisher-details-page.component.html',
  styleUrls: ['./publisher-details-page.component.css']
})
export class PublisherDetailsPageComponent implements OnInit, OnDestroy {
  publishers_subscription: Subscription;
  comics: Comic[];
  selected_comics_subscription: Subscription;
  selected_comics: Comic[];

  protected layout = 'grid';
  protected sort_field = 'volume';
  protected rows = 10;
  protected same_height = true;
  protected cover_size = 200;

  publisher_name: string;

  constructor(
    private library_adaptor: LibraryAdaptor,
    private selection_adaptor: SelectionAdaptor,
    private activatedRoute: ActivatedRoute
  ) {
    this.activatedRoute.params.subscribe(params => {
      this.publisher_name = params['name'];
    });
  }

  ngOnInit() {
    this.publishers_subscription = this.library_adaptor.publisher$.subscribe(
      publishers => {
        const result = publishers.find(
          publisher => publisher.name === this.publisher_name
        );
        this.comics = result ? result.comics : [];
      }
    );
    this.selected_comics_subscription = this.selection_adaptor.comic_selection$.subscribe(
      selected_comics => (this.selected_comics = selected_comics)
    );
  }

  ngOnDestroy() {
    this.publishers_subscription.unsubscribe();
    this.selected_comics_subscription.unsubscribe();
  }

  set_layout(dataview: any, layout: string): void {
    dataview.changeLayout(layout);
  }

  set_sort_field(sort_field: string): void {
    this.sort_field = sort_field;
  }

  set_rows(rows: number): void {
    this.rows = rows;
  }

  set_cover_size(cover_size: number): void {
    this.cover_size = cover_size;
  }

  set_same_height(same_height: boolean): void {
    this.same_height = same_height;
  }
}
