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

import {Component, OnInit, Input} from '@angular/core';
import {Router} from '@angular/router';
import {Observable} from 'rxjs/Observable';

import {ComicService} from '../comic.service';
import {AlertService} from '../../alert.service';
import {Page} from '../page.model';
import {Comic} from '../comic.model';

@Component({
  selector: 'app-duplicate-list-entry',
  templateUrl: './duplicate-page-list-entry.component.html',
  styleUrls: ['./duplicate-page-list-entry.component.css']
})
export class DuplicatePageListEntryComponent implements OnInit {
  @Input() page_hash: string;
  @Input() pages: Array<Page>;
  @Input() comics: Comic[];
  @Input() pages_for_comic_id: Map<number, Page>;
  @Input() page_title: string;
  @Input() page_subtitle: string;
  image_url: string;
  image_size: number;
  all_are_deleted: boolean;
  show_comics = false;
  delete_page_title: string;
  undelete_page_title: string;
  delete_page_message: string;
  undelete_page_message: string;
  confirm_button = 'Yes';
  cancel_button = 'No';

  constructor(
    private router: Router,
    private comic_service: ComicService,
    private errors_service: AlertService,
  ) {}

  ngOnInit() {
    const that = this;
    this.update_all_are_deleted();
    this.image_url = this.comic_service.geturl_for_page_by_id(this.pages[0].id);
    this.comic_service.get_user_preference('cover_size').subscribe(
      (cover_size: number) => {
        that.image_size = cover_size || 175;
      },
      (error: Error) => {
        that.errors_service.show_error_message('Error loading user preference: cover_size', error);
      }
    );
  }

  update_all_are_deleted(): void {
    this.all_are_deleted = this.pages.every((page) => page.deleted === true);
  }

  get_cover_url_for_comic(comic_id: number): string {
    return this.comic_service.get_url_for_page_by_comic_index(comic_id, 0);
  }

  delete_all_pages(): void {
    this.pages.forEach((page) => this.delete_page(page));
  }

  undelete_all_pages(): void {
    this.pages.forEach((page) => this.undelete_page(page));
  }

  page_is_deleted_in_comic(comic: Comic): boolean {
    return this.pages_for_comic_id[comic.id].deleted;
  }

  delete_page_in_comic(comic: Comic): void {
    const page = this.pages_for_comic_id[comic.id];
    this.delete_page(page);
  }

  undelete_page_in_comic(comic: Comic): void {
    const page = this.pages_for_comic_id[comic.id];
    this.undelete_page(page);
  }

  delete_page(page: Page): void {
    this.comic_service.mark_page_as_deleted(page).subscribe(
      (response) => {
        page.deleted = true;
      },
      (error: Error) => {
        this.errors_service.show_error_message(error.message, error);
      },
      () => {
        this.update_all_are_deleted();
      }
    );
  }

  undelete_page(page: Page): void {
    this.comic_service.mark_page_as_undeleted(page).subscribe(
      (response) => {
        page.deleted = false;
      },
      (error: Error) => {
        this.errors_service.show_error_message(error.message, error);
      },
      () => {
        this.update_all_are_deleted();
      }
    );
  }
}
