/*
 * ComixEd - A digital comic book library management application.
 * Copyright (C) 2017, Darryl L. Pierce
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

import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import {Comic} from '../comic.model';
import {ComicService} from '../comic.service';
import {ComicListEntryComponent} from '../comic-list-entry/comic-list-entry.component';
import {SeriesFilterPipe} from '../series-filter.pipe';
import {ErrorsService} from '../../errors.service';

@Component({
  selector: 'app-comic-list',
  templateUrl: './comic-list.component.html',
  styleUrls: ['./comic-list.component.css'],
  providers: [ComicService],
})
export class ComicListComponent implements OnInit {
  comics: Comic[];
  cover_size: number;
  all_series: string[];
  title_search: string;
  current_comic: Comic;
  current_page = 1;
  show_search_box = true;
  page_sizes: any[] = [
    {id: 0, label: '10 comics'},
    {id: 1, label: '25 comics'},
    {id: 2, label: '50 comics'},
    {id: 3, label: '100 comics'}
  ];
  page_size = 10;
  sort_options: any[] = [
    {id: 0, label: 'Default'},
    {id: 1, label: 'Sort by series'},
    {id: 2, label: 'Sort by added date'},
    {id: 3, label: 'Sort by cover date'},
    {id: 4, label: 'Sort by last read date'},
  ];

  constructor(private router: Router, private comicService: ComicService, private errorsService: ErrorsService) {}

  ngOnInit() {
    this.comicService.all_comics_update.subscribe(
      (comics: Comic[]) => {
        this.comics = comics;
      }
    );
    this.comicService.current_comic.subscribe(
      (comic: Comic) => {
        this.current_comic = comic;
      });
    this.comicService.get_user_preference('cover_size').subscribe(
      (cover_size: number) => {
        this.cover_size = cover_size;
      },
      (error: Error) => {
        console.log('ERROR:', error.message);
        this.errorsService.fireErrorMessage('Error loading user preference: cover_size');
      }
    );
  }

  getImageURL(comic: Comic): string {
    if (comic.missing === true) {
      return this.comicService.getMissingImageUrl();
    } else {
      return this.comicService.getImageUrl(comic.id, 0);
    }
  }

  setPageSize(size_id: any): void {
    switch (parseInt(size_id, 10)) {
      case 0: this.page_size = 10; break;
      case 1: this.page_size = 25; break;
      case 2: this.page_size = 50; break;
      case 3: this.page_size = 100; break;
    }
  }

  setSortOption(sort_id: any): void {
    this.comics.sort((comic1: Comic, comic2: Comic) => {
      switch (parseInt(sort_id, 10)) {
        case 0: return this.naturalSort(comic1, comic2);
        case 1: return this.seriesSort(comic1, comic2);
        case 2: return this.dateAddedSort(comic1, comic2);
        case 3: return this.coverDateSort(comic1, comic2);
        case 4: return this.lastReadDateSort(comic1, comic2);
        default: console.log('Invalid sort value: ' + sort_id);
      }
      return 0;
    });
  }

  naturalSort(comic1: Comic, comic2: Comic): number {
    if (comic1.id < comic2.id) {return -1;}
    if (comic1.id > comic2.id) {return 1;}
    return 0;
  }

  seriesSort(comic1: Comic, comic2: Comic): number {
    if (comic1.series != comic2.series) {
      if (comic1.series < comic2.series) {return -1;} else {return 1;}
    } else if (comic1.volume != comic2.volume) {
      if (comic1.volume < comic2.volume) {return -1;} else {return 1;}
    } else if (comic1.issue_number != comic2.issue_number) {
      if (comic1.issue_number < comic2.issue_number) {return -1;} else {return 1;}
    }

    // if we're here then the fields are all equal
    return 0;
  }

  dateAddedSort(comic1: Comic, comic2: Comic): number {
    if (comic1.added_date < comic2.added_date) {return -1;}
    if (comic1.added_date > comic2.added_date) {return 1;}
    return 0;
  }

  coverDateSort(comic1: Comic, comic2: Comic): number {
    if (comic1.cover_date < comic2.cover_date) {return -1;}
    if (comic1.cover_date > comic2.cover_date) {return 1;}
    return 0;
  }

  lastReadDateSort(comic1: Comic, comic2: Comic): number {
    if (comic1.last_read_date < comic2.last_read_date) {return -1;}
    if (comic1.last_read_date > comic2.last_read_date) {return 1;}
    return 0;
  }

  getTitleTextFor(comic: Comic): string {
    let result = comic.series || comic.filename;

    if (comic.issue_number != null) {
      result = result + ' #' + comic.issue_number;
    }
    if (comic.volume != null) {
      result = result + ' (v' + comic.volume + ')';
    }

    return result;
  }

  openSelectedComic(): void {
    this.router.navigate(['comics', this.current_comic.id]);
  }

  save_cover_size(): void {
    this.comicService.set_user_preference('cover_size', String(this.cover_size));
  }
}
