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

import { Component, Input, OnInit } from '@angular/core';
import { SelectItem } from 'primeng/api';
import { Comic } from 'app/library';
import { Page } from 'app/models/comics/page';
import { PageType } from 'app/models/comics/page-type';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { ComicService } from 'app/services/comic.service';
import { UserService } from 'app/services/user.service';
import { MessageService } from 'primeng/components/common/messageservice';
import { AppState } from 'app/app.state';
import { LibraryAdaptor } from 'app/library';

@Component({
  selector: 'app-comic-pages',
  templateUrl: './comic-pages.component.html',
  styleUrls: ['./comic-pages.component.css']
})
export class ComicPagesComponent implements OnInit {
  @Input() is_admin: boolean;
  @Input() comic: Comic;
  @Input() image_size: number;

  protected page_type_options: Array<SelectItem> = [];

  constructor(
    private library_adaptor: LibraryAdaptor,
    private translate_service: TranslateService,
    private comic_service: ComicService,
    private user_service: UserService,
    private store: Store<AppState>,
    private message_service: MessageService
  ) {}

  ngOnInit() {
    this.comic_service.get_page_types().subscribe((page_types: PageType[]) => {
      page_types.forEach((page_type: PageType) => {
        this.page_type_options.push({
          label: page_type.name,
          value: page_type.id
        });
      });
    });
    // TODO fix the preference here
    //    this.image_size = parseInt(this.user_service.get_user_preference('cover_size', '200'), 10);
  }

  set_page_type(page: Page, page_type_id: string): void {
    const new_page_type = parseInt(page_type_id, 10);
    this.comic_service.set_page_type(page, new_page_type).subscribe(
      () => {
        page.page_type.id = new_page_type;
        this.message_service.add({
          severity: 'info',
          summary: 'Page Type',
          detail: 'Page type changed...'
        });
      },
      (error: Error) => {
        this.message_service.add({
          severity: 'error',
          summary: 'Page Type',
          detail: 'Failed to change the page type...'
        });
      }
    );
  }

  set_page_blocked(page: Page): void {
    this.library_adaptor.block_page_hash(page.hash);
  }

  set_page_unblocked(page: Page): void {
    this.library_adaptor.unblock_page_hash(page.hash);
  }
}
