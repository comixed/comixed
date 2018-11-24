/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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

import { Component, OnInit, Input } from '@angular/core';
import { SelectItem } from 'primeng/api';
import { Comic } from '../../../../models/comic';
import { Page } from '../../../../models/page';
import { PageType } from '../../../../models/page-type';
import { AlertService } from '../../../../services/alert.service';
import { ComicService } from '../../../../services/comic.service';
import { UserService } from '../../../../services/user.service';

@Component({
  selector: 'app-comic-pages',
  templateUrl: './comic-pages.component.html',
  styleUrls: ['./comic-pages.component.css']
})
export class ComicPagesComponent implements OnInit {
  @Input() comic: Comic;
  @Input() image_size: number;

  protected page_type_options: Array<SelectItem> = [];

  constructor(
    private alert_service: AlertService,
    private comic_service: ComicService,
    private user_service: UserService,
  ) { }

  ngOnInit() {
    this.comic_service.get_page_types().subscribe((page_types: PageType[]) => {
      page_types.forEach((page_type: PageType) => {
        this.page_type_options.push({ label: page_type.name, value: page_type.id });
      });
    });
    this.image_size = parseInt(this.user_service.get_user_preference('cover_size', '200'), 10);
  }

  get_url_for_page(page: Page): string {
    return this.comic_service.get_url_for_page_by_id(page.id);
  }

  set_page_type(page: Page, page_type_id: string): void {
    const new_page_type = parseInt(page_type_id, 10);
    this.comic_service.set_page_type(page, new_page_type).subscribe(
      () => {
        page.page_type.id = new_page_type;
        this.alert_service.show_info_message('Page type changed...');
      },
      (error: Error) => {
        this.alert_service.show_error_message('Failed to change page type...', error);
      });
  }

  set_blocked_state(page: Page, blocked: boolean): void {
    this.comic_service.set_block_page(page.hash, blocked).subscribe(
      () => {
        page.blocked = blocked;
        this.alert_service.show_info_message(`${blocked ? 'Blocked' : 'Unblocked'} all pages with this hash...`);
      },
      (error: Error) => {
        this.alert_service.show_error_message('Failed to change blocked state...', error);
      });
  }
}

