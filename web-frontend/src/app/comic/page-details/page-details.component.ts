/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project.
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

import { ComicService } from '../../services/comic.service';
import { UserService } from '../../services/user.service';
import { AlertService } from '../../services/alert.service';
import { Comic } from '../comic.model';
import { Page } from '../page.model';
import { PageType } from '../page-type.model';

@Component({
  selector: 'app-page-details',
  templateUrl: './page-details.component.html',
  styleUrls: ['./page-details.component.css']
})
export class PageDetailsComponent implements OnInit {
  @Input() page: Page;
  @Input() comic: Comic;
  @Input() image_size: number;
  page_types: PageType[];
  delete_page_title = 'Delete This Page?';
  delete_page_message = 'Are you sure you want to delete this page?';
  undelete_page_title = 'Undelete This Page?';
  undelete_page_message = 'Are you sure you want to undelete this page?';
  confirm_button = 'Yes';
  cancel_button = 'No';

  constructor(
    private comic_service: ComicService,
    private user_service: UserService,
    private alert_service: AlertService,
  ) {
    this.page_types = [];
  }

  ngOnInit() {
    this.comic_service.get_page_types().subscribe(
      (page_types: PageType[]) => {
        this.page_types = page_types;
      },
      (error: Error) => {
        this.alert_service.show_error_message('Unable to retrieve page types', error);
      }
    );
  }

  get_title_for_current_page(): string {
    return this.page.filename;
  }

  get_image_url_for_current_page(): string {
    if (this.page) {
      return this.comic_service.get_url_for_page_by_id(this.page.id);
    }
    return '';
  }

  get_display_name_for_page_type(page_type: PageType): string {
    return this.comic_service.get_display_name_for_page_type(page_type);
  }

  set_page_type(page_type_id: number): void {
    const that = this;
    this.comic_service.set_page_type(this.page, page_type_id).subscribe(
      () => {
        that.page.page_type = that.page_types.find((the_type: PageType) => {
          return the_type.id === page_type_id;
        });
      },
      (error: Error) => {
        that.alert_service.show_error_message('Unable to set the page type', error);
      });
  }

  delete_page(): void {
    // if this page is already deleted, then return
    if (this.page.deleted) {
      return;
    }
    this.comic_service.mark_page_as_deleted(this.page).subscribe(
      (response: Response) => {
        this.page.deleted = true;
        this.comic.deleted_page_count = this.comic.deleted_page_count + 1;
      },
      (error: Error) => {
        this.alert_service.show_error_message('Unable to delete page...', error);
      }
    );
  }

  undelete_page(): void {
    // if this page isn't deleted then exit
    if (this.page.deleted === false) {
      return;
    }
    this.comic_service.mark_page_as_undeleted(this.page).subscribe(
      (response: Response) => {
        this.page.deleted = false;
        this.comic.deleted_page_count = this.comic.deleted_page_count - 1;
      },
      (error: Error) => {
        this.alert_service.show_error_message('Unable to undelete page...', error);
      }
    );
  }

  block_page(): void {
    // don't block a blocked page
    if (this.page.blocked) {
      return;
    }
    this.comic_service.block_page(this.page.hash).subscribe(
      (response: Response) => {
        this.page.blocked = true;
        this.comic.blocked_page_count = this.comic.blocked_page_count + 1;
        this.comic_service.reload_comics();
      },
      (error: Error) => {
        this.alert_service.show_error_message('Failed to block pages list this...', error);
      }
    );
  }

  unblock_page(): void {
    // don't unblock a page that's not blocked
    if (this.page.blocked === false) {
      return;
    }
    this.comic_service.unblock_page(this.page.hash).subscribe(
      (response: Response) => {
        this.page.blocked = false;
        this.comic.blocked_page_count = this.comic.blocked_page_count - 1;
        this.comic_service.reload_comics();
      },
      (error: Error) => {
        this.alert_service.show_error_message('Failed to unblock pages like this page...', error);
      }
    );
  }
}
