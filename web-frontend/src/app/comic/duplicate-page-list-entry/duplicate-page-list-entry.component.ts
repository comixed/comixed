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
  Input,
} from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { UserService } from '../../services/user.service';
import { ComicService } from '../comic.service';
import { AlertService } from '../../alert.service';
import { Page } from '../page.model';
import { Comic } from '../comic.model';

@Component({
  selector: 'app-duplicate-list-entry',
  templateUrl: './duplicate-page-list-entry.component.html',
  styleUrls: ['./duplicate-page-list-entry.component.css']
})
export class DuplicatePageListEntryComponent implements OnInit {
  @Input() page_hash: string;
  @Input() show_pages_target: Subject<Array<Page>>;
  @Input() delete_page_target: Subject<Page>;
  @Input() undelete_page_target: Subject<Page>;
  pages: Array<Page>;
  all_are_deleted = false;
  confirm_button = 'Yes';
  cancel_button = 'No';
  image_url: string;
  image_size: number;
  show_comics = false;

  constructor(
    private router: Router,
    private user_service: UserService,
    private comic_service: ComicService,
    private alert_service: AlertService,
  ) {
    this.pages = [];
  }

  ngOnInit() {
    const that = this;
    this.image_url = this.comic_service.get_url_for_page_by_hash(this.page_hash);
    this.image_size = parseInt(this.user_service.get_user_preference('cover_size', '200'), 10);
    this.update_all_are_deleted();
    this.comic_service.get_pages_for_hash(this.page_hash).subscribe(
      (pages: Array<Page>) => {
        this.pages = pages;
        this.update_all_are_deleted();
      },
      (error: Error) => {
        this.alert_service.show_error_message('Error getting pages for duplicate hash...', error);
      }
    );
    this.delete_page_target.subscribe(
      (page: Page) => {
        if (this.pages.includes(page)) {
          this.delete_page(page);
        }
      }
    );
    this.undelete_page_target.subscribe(
      (page: Page) => {
        if (this.pages.includes(page)) {
          this.undelete_page(page);
        }
      }
    );
  }

  update_all_are_deleted(): void {
    this.all_are_deleted = this.pages.every((page) => page.deleted === true);
  }

  delete_all_pages(): void {
    this.pages.forEach((page) => this.delete_page(page));
  }

  undelete_all_pages(): void {
    this.pages.forEach((page) => this.undelete_page(page));
  }

  delete_page(page: Page): void {
    this.comic_service.mark_page_as_deleted(page).subscribe(
      (response) => {
        page.deleted = true;
      },
      (error: Error) => {
        this.alert_service.show_error_message(error.message, error);
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
        this.alert_service.show_error_message(error.message, error);
      },
      () => {
        this.update_all_are_deleted();
      }
    );
  }

  show_comics_clicked(event: any): void {
    this.show_pages_target.next(this.pages);
    event.preventDefault();
  }
}
