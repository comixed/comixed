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

import {
  Component,
  OnInit,
  Input,
} from '@angular/core';
import { Comic } from '../../../../models/comic.model';
import { Page } from '../../../../models/page.model';
import { PageType } from '../../../../models/page-type.model';
import { AlertService } from '../../../../services/alert.service';
import { ComicService } from '../../../../services/comic.service';
import { PageDetailsComponent } from '../../../../comic/page-details/page-details.component';

@Component({
  selector: 'app-comic-pages',
  templateUrl: './comic-pages.component.html',
  styleUrls: ['./comic-pages.component.css']
})
export class ComicPagesComponent implements OnInit {
  @Input() comic: Comic;
  @Input() image_size: number;
  page_types: PageType[];

  constructor(
    private alert_service: AlertService,
    private comic_service: ComicService,
  ) { }

  ngOnInit() {
    this.comic_service.get_page_types().subscribe((page_types: PageType[]) => {
      this.page_types = page_types;
    });
  }

  get_url_for_page(page: Page): string {
    return this.comic_service.get_url_for_page_by_id(page.id);
  }

  set_page_type(page: Page, page_type_id: string): void {
    const new_page_type = parseInt(page_type_id, 10);
    this.comic_service.set_page_type(page, new_page_type).subscribe(
      () => {
        page.page_type.id = new_page_type;
      },
      (error: Error) => {
        this.alert_service.show_error_message('Failed to change page type...', error);
      });
  }
}
