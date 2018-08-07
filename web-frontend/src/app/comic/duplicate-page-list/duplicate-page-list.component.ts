/*
 * ComixEd - A digital comic book library management application.
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

import {Component, OnInit} from '@angular/core';

import {ComicService} from '../comic.service';
import {Page} from '../page.model';
import {Comic} from '../comic.model';
import {DuplicatePageListEntryComponent} from '../duplicate-page-list-entry/duplicate-page-list-entry.component';

@Component({
  selector: 'app-duplicate-page-list',
  templateUrl: './duplicate-page-list.component.html',
  styleUrls: ['./duplicate-page-list.component.css']
})
export class DuplicatePageListComponent implements OnInit {
  protected page_hashes = new Array<string>();
  protected comics_by_page_hash = new Map<string, Array<Comic>>();
  protected pages_by_page_hash = new Map<string, Array<Page>>();
  protected pages_for_comic_id_by_page_hash = new Map<string, Map<number, Page>>();
  protected page_count = 0;
  protected comic_count = 0;
  protected show_consolidation_div = true;
  protected working = Array<any>();

  constructor(
    private comic_service: ComicService,
  ) {}

  ngOnInit() {
    const that = this;
    this.working.push(true);
    this.comic_service.get_duplicate_page_list().subscribe(
      (pages: Page[]) => {
        const comic_ids = [];
        pages.forEach((page) => {
          that.working.push(true);
          // if this is the first time we've seen this hash, register it and create the page array
          if (that.page_hashes.includes(page.hash) === false) {
            that.page_count = that.page_count + 1;
            that.page_hashes.push(page.hash);
            that.comics_by_page_hash[page.hash] = [];
            that.pages_by_page_hash[page.hash] = [];
            that.pages_for_comic_id_by_page_hash[page.hash] = new Map<number, Page>();
          }
          // store the page itself
          that.pages_by_page_hash[page.hash].push(page);

          // it's possible the same page is in a comic twice, but let's ignore that
          that.comic_service.load_comic_from_remote(page.comic_id).subscribe(
            (comic: Comic) => {
              that.comics_by_page_hash[page.hash].push(comic);
              that.comic_count = that.comic_count + 1;
              that.pages_for_comic_id_by_page_hash[page.hash][comic.id] = page;
              that.working.pop();
            }
          );
        });
        that.working.pop();
      });
  }

  is_working(): boolean {
    return this.working.length > 0;
  }

  get_title_for_hash(page_hash): string {
    const comics = this.comics_by_page_hash[page_hash];
    return 'Appears in ' + comics.length + ' comic' + (comics.length > 1 ? 's' : '') + '.';
  }

  toggle_consolidation_message(): void {
    this.show_consolidation_div = !this.show_consolidation_div;
  }
}
