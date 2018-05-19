import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import {Comic} from '../comic.model';
import {ComicService} from '../comic.service';
import {ComicListEntryComponent} from '../comic-list-entry/comic-list-entry.component';
import {SeriesFilterPipe} from '../series-filter.pipe';

@Component({
  selector: 'app-comic-list',
  templateUrl: './comic-list.component.html',
  styleUrls: ['./comic-list.component.css'],
  providers: [ComicService],
})
export class ComicListComponent implements OnInit {
  private comics: Comic[];
  private comic_count: number = 0;
  private read_count: number = 0;
  private all_series: string[];
  private title_search: string;
  private current_comic: Comic;
  private current_page: number = 1;
  private page_sizes: any[] = [
    {id: 0, label: '10 comics'},
    {id: 1, label: '25 comics'},
    {id: 2, label: '50 comics'},
    {id: 3, label: '100 comics'}
  ];
  private page_size: number = 10;
  private sort_options: any[] = [
    {id: 0, label: 'Default'},
    {id: 1, label: 'Sort by series'},
    {id: 2, label: 'Sort by added date'},
    {id: 3, label: 'Sort by cover date'},
    {id: 4, label: 'Sort by last read date'},
  ];

  constructor(private router: Router, private comicService: ComicService) {}

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
    setInterval(() => {
      this.comicService.getComicCount().subscribe(
        count => this.comic_count = count,
        error => console.log('ERROR:', error.message));
    }, 250);
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

      let left: any;
      let right: any;

      switch (parseInt(sort_id, 10)) {
        case 1: left = comic1.series; right = comic2.series; break;
        case 2: left = comic1.added_date; right = comic2.added_date; break;
        case 3: left = comic1.cover_date; right = comic2.cover_date; break;
        case 4: left = comic1.last_read_date; right = comic2.last_read_date; break;
        default: left = comic1.id; right = comic2.id; break;
      }

      if (left < right) {
        return -1;
      }
      if (left > right) {
        return 1;
      }
      return 0;
    });
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
}
