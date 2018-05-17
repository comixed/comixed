import {Component, OnInit} from '@angular/core';

import {ComicService} from '../comic.service';
import {Page} from '../page.model';
import {DuplicatePageListEntryComponent} from '../duplicate-page-list-entry/duplicate-page-list-entry.component';

@Component({
  selector: 'app-duplicate-page-list',
  templateUrl: './duplicate-page-list.component.html',
  styleUrls: ['./duplicate-page-list.component.css']
})
export class DuplicatePageListComponent implements OnInit {
  count: number;
  pages: Page[];

  constructor(private comicService: ComicService) {}

  ngOnInit() {
    this.comicService.getDuplicatePageCount().subscribe(
      count => {
        this.count = count;
      });
    this.comicService.getDuplicatePages().subscribe(
      pages => {
        this.pages = pages.sort((a, b) => {
          if (a.hash < b.hash) {
            return -1;
          }
          if (a.hash > b.hash) {
            return 1;
          }
          return 0;
        });
      });
  }
}
