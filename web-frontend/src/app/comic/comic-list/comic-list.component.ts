/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project.
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

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { PageSizeComponent } from '../page-size/page-size.component';
import { GroupComicsComponent } from '../group-comics/group-comics.component';
import { GroupByPipe } from '../group-by.pipe';
import { UserService } from '../../services/user.service';
import { Comic } from '../comic.model';
import { ComicService } from '../comic.service';
import { ComicListEntryComponent } from '../comic-list-entry/comic-list-entry.component';
import { ComicListGroupComponent } from '../comic-list-group/comic-list-group.component';
import { SeriesFilterPipe } from '../series-filter.pipe';
import { AlertService } from '../../alert.service';

@Component({
  selector: 'app-comic-list',
  templateUrl: './comic-list.component.html',
  styleUrls: ['./comic-list.component.css'],
})
export class ComicListComponent implements OnInit {
  protected comics: Comic[];
  protected cover_size: number;
  protected all_series: string[];
  protected title_search: string;
  protected current_comic: Comic;
  protected current_page = 1;
  protected show_search_box = true;
  protected use_page_size: number;
  protected current_pages = new Map<string, number>();
  protected group_by_value: number;
  protected last_group_label: string;
  protected groups: Map<string, Array<Comic>>;
  protected sort_options: any[] = [
    { id: 0, label: 'Sort by series' },
    { id: 1, label: 'Sort by added date' },
    { id: 2, label: 'Sort by cover date' },
    { id: 3, label: 'Sort by last read date' },
  ];
  protected sort_order_value: number;
  protected sort_order: BehaviorSubject<number>;

  constructor(
    private router: Router,
    private user_service: UserService,
    private comic_service: ComicService,
    private alert_service: AlertService,
    private route: ActivatedRoute,
  ) {
    const that = this;

    this.comics = this.comic_service.all_comics;
    this.group_by_value = 0;
    this.last_group_label = '';
    route.queryParams.subscribe(params => {
      this.reload_page_size(params['page_size']);
      this.reload_sort_order(params['sort_order']);
      this.reload_group_by(params['group_by']);
    });
  }

  private reload_page_size(page_size: string): void {
    if (page_size) {
      this.use_page_size = parseInt(page_size, 10);
    } else {
      this.use_page_size = parseInt(this.user_service.get_user_preference('page_size', '10'), 10);
    }
  }

  private reload_sort_order(sort_order: string): void {
    if (sort_order) {
      this.sort_order_value = parseInt(sort_order, 10);

      if ((this.sort_order_value < 0) || (this.sort_order_value > 3)) {
        this.sort_order_value = 0;
      }
    } else {
      this.sort_order_value = parseInt(this.user_service.get_user_preference('sort_order', '0'), 10);
    }
    this.sort_order = new BehaviorSubject<number>(this.sort_order_value);
  }

  private reload_group_by(group_by: string): void {
    if (group_by) {
      this.group_by_value = parseInt(group_by, 10);

      if ((this.group_by_value < 0) || (this.group_by_value > 3)) {
        this.group_by_value = 0;
      }
    } else {
      this.group_by_value = parseInt(this.user_service.get_user_preference('group_by', '0'), 10);
    }
  }

  ngOnInit() {
    this.comic_service.all_comics_update.subscribe(
      (comics: Comic[]) => {
        this.comics = this.sort_comics(comics);
      }
    );
    this.comic_service.current_comic.subscribe(
      (comic: Comic) => {
        this.current_comic = comic;
      });
    this.cover_size = parseInt(this.user_service.get_user_preference('cover_size', '200'), 10);
    if (this.cover_size < 200) {
      this.cover_size = 200;
    }
    if (this.cover_size > 640) {
      this.cover_size = 640;
    }
  }

  get_image_url(comic: Comic): string {
    if (comic.missing === false) {
      return this.comic_service.get_url_for_page_by_comic_index(comic.id, 0);
    } else {
      return this.comic_service.get_url_for_missing_page();
    }
  }

  set_sort_order(sort_order: any): void {
    this.sort_order_value = parseInt(sort_order, 10);
    this.comics = this.sort_comics(this.comics);
    this.user_service.set_user_preference('sort_order', `${sort_order}`);
  }

  sort_comics(comics: Comic[]): Comic[] {
    comics.sort((comic1: Comic, comic2: Comic) => {
      switch (this.sort_order_value) {
        case 0: return this.sort_by_series_name(comic1, comic2);
        case 1: return this.sort_by_date_added(comic1, comic2);
        case 2: return this.sort_by_cover_date(comic1, comic2);
        case 3: return this.sort_by_last_read_date(comic1, comic2);
        default: console.log('Invalid sort value: ' + this.sort_order_value);
      }
      return 0;
    });
    return comics;
  }

  get_sort_order(): Observable<number> {
    return this.sort_order.asObservable();
  }

  sort_by_natural_order(comic1: Comic, comic2: Comic): number {
    if (comic1.id < comic2.id) {
      return -1;
    }
    if (comic1.id > comic2.id) {
      return 1;
    }
    return 0;
  }

  sort_by_series_name(comic1: Comic, comic2: Comic): number {
    if (comic1.series !== comic2.series) {
      if (comic1.series < comic2.series) {
        return -1;
      } else {
        return 1;
      }
    } else if (comic1.volume !== comic2.volume) {
      if (comic1.volume < comic2.volume) {
        return -1;
      } else {
        return 1;
      }
    } else if (comic1.issue_number !== comic2.issue_number) {
      if (comic1.issue_number < comic2.issue_number) {
        return -1;
      } else {
        return 1;
      }
    }

    // if we're here then the fields are all equal
    return 0;
  }

  sort_by_date_added(comic1: Comic, comic2: Comic): number {
    if (comic1.added_date < comic2.added_date) {
      return -1;
    }
    if (comic1.added_date > comic2.added_date) {
      return 1;
    }
    return 0;
  }

  sort_by_cover_date(comic1: Comic, comic2: Comic): number {
    if (comic1.cover_date < comic2.cover_date) {
      return -1;
    }
    if (comic1.cover_date > comic2.cover_date) {
      return 1;
    }
    return 0;
  }

  sort_by_last_read_date(comic1: Comic, comic2: Comic): number {
    if (comic1.last_read_date < comic2.last_read_date) {
      return -1;
    }
    if (comic1.last_read_date > comic2.last_read_date) {
      return 1;
    }
    return 0;
  }

  get_title_text_for(comic: Comic): string {
    let result = comic.series || comic.filename;

    if (comic.issue_number != null) {
      result = result + ' #' + comic.issue_number;
    }
    if (comic.volume != null) {
      result = result + ' (v' + comic.volume + ')';
    }

    return result;
  }

  open_selected_comic(): void {
    this.router.navigate(['comics', this.current_comic.id]);
  }

  save_cover_size(): void {
    this.user_service.set_user_preference('cover_size', String(this.cover_size));
  }

  handle_comic_clicked(event): void {
  }

  show_group_label(comic: Comic): boolean {
    switch (this.group_by_value) {
      case 1:
        if (this.last_group_label !== this.get_comic_series_label(comic)) {
          this.last_group_label = this.get_comic_series_label(comic);
          return true;
        }
        break;
      case 2:
        if (this.last_group_label !== this.get_comic_publisher_label(comic)) {
          this.last_group_label = this.get_comic_publisher_label(comic);
          return true;
        }
    }
    return false;
  }

  get_group_label(comic: Comic): string {
    switch (this.group_by_value) {
      case 1: return this.get_comic_series_label(comic);
      case 2: return this.get_comic_series_label(comic);
    }
    return comic.filename;
  }

  get_comic_series_label(comic: Comic): string {
    return `${comic.series || 'Unknown'} (${comic.volume || 'Unknown'})`;
  }

  get_comic_publisher_label(comic: Comic): string {
    return `${comic.publisher || 'Unknown'}`;
  }

  get_comic_published_year_label(comic: Comic): string {
    return `${comic.year_published || '1900'}`;
  }

  is_new_label(last_group_label: string, comic: Comic): boolean {
    switch (this.group_by_value) {
      case 1: return (last_group_label !== this.get_comic_series_label(comic));
      case 2: return (last_group_label !== this.get_comic_publisher_label(comic));
      case 3: return (last_group_label !== this.get_comic_published_year_label(comic));
    }

    return true;
  }

  get_label_for(comic: Comic): string {
    let result = comic.filename;

    switch (this.group_by_value) {
      case 1: result = this.get_comic_series_label(comic); break;
      case 2: result = this.get_comic_publisher_label(comic); break;
      case 3: result = this.get_comic_published_year_label(comic); break;
    }

    this.last_group_label = result;

    return result;
  }

  set_grouping(value: any): void {
    this.group_by_value = parseInt(value.target.value, 10);
    this.user_service.set_user_preference('group_by', `${this.group_by_value}`);
  }

  set_page_size(value: any): void {
    this.use_page_size = parseInt(value.target.value, 10);
    this.user_service.set_user_preference('page_size', `${this.use_page_size}`);
  }
}
