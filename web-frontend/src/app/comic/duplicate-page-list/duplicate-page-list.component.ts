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

import {
  Component,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { ComicService } from '../comic.service';
import { UserService } from '../../services/user.service';
import { AlertService } from '../../alert.service';
import { Page } from '../page.model';
import { Comic } from '../comic.model';
import { DuplicatePageListEntryComponent } from '../duplicate-page-list-entry/duplicate-page-list-entry.component';

@Component({
  selector: 'app-duplicate-page-list',
  templateUrl: './duplicate-page-list.component.html',
  styleUrls: ['./duplicate-page-list.component.css']
})
export class DuplicatePageListComponent implements OnInit, OnDestroy {
  protected page_hashes: Array<string>;
  protected page_sizes: any[] = [
    { id: 0, label: '10 comics' },
    { id: 1, label: '25 comics' },
    { id: 2, label: '50 comics' },
    { id: 3, label: '100 comics' }
  ];
  protected page_size = 10;
  protected current_page;
  protected show_pages_subject: Subject<Array<Page>>;
  protected delete_page_subject: Subject<Page>;
  protected undelete_page_subject: Subject<Page>;
  protected show_pages: Array<Page>;
  protected image_size: number;

  constructor(
    private comic_service: ComicService,
    private user_service: UserService,
    private alert_service: AlertService,
  ) {
    this.page_hashes = [];
    this.show_pages = [];
    this.show_pages_subject = new BehaviorSubject<Array<Page>>([]);
    this.delete_page_subject = new BehaviorSubject<Page>(null);
    this.undelete_page_subject = new BehaviorSubject<Page>(null);
  }

  ngOnInit() {
    const that = this;
    this.image_size = parseInt(this.user_service.get_user_preference('cover_size', '128'), 10);
    this.alert_service.show_busy_message('Loading Duplicate Pages...');
    this.comic_service.get_duplicate_page_hashes().subscribe(
      (page_hashes: Array<string>) => {
        that.page_hashes = page_hashes;
        that.alert_service.show_busy_message('');
      });
    this.show_pages_subject.subscribe(
      (pages: Page[]) => {
        that.show_pages = pages;
      }
    );
  }

  ngOnDestroy(): void {
    this.alert_service.show_busy_message('');
  }

  set_page_size(page_size_choice: string): void {
    switch (parseInt(page_size_choice, 10)) {
      case 0: this.page_size = 10; break;
      case 1: this.page_size = 25; break;
      case 2: this.page_size = 50; break;
      case 3: this.page_size = 100; break;
    }
  }

  get_cover_url_for_page(page: Page): string {
    return this.comic_service.get_url_for_page_by_comic_index(page.comic_id, 0);
  }

  get_title_text_for_page(page: Page): string {
    const comic = this.comic_service.all_comics.find((this_comic: Comic) => {
      return this_comic.id === page.comic_id;
    });

    if (!comic) {
      return '';
    }

    return `${comic.series || 'Unknown'} #${comic.issue_number || '???'}`;
  }

  get_subtitle_text_for_page(page: Page): string {
    return `${page.width} x ${page.height}`;
  }

  delete_page(page: Page): void {
    this.delete_page_subject.next(page);
  }

  undelete_page(page: Page): void {
    this.undelete_page_subject.next(page);
  }
}
