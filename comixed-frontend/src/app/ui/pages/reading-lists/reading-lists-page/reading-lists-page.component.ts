/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { ReadingList, ReadingListAdaptor } from 'app/library';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-reading-lists-page',
  templateUrl: './reading-lists-page.component.html',
  styleUrls: ['./reading-lists-page.component.css']
})
export class ReadingListsPageComponent implements OnInit, OnDestroy {
  reading_lists_subscription: Subscription;
  reading_lists: ReadingList[];

  constructor(
    private title_service: Title,
    private translate_service: TranslateService,
    private reading_list_adaptor: ReadingListAdaptor,
    private router: Router
  ) {}

  ngOnInit() {
    this.reading_lists_subscription = this.reading_list_adaptor.reading_list$.subscribe(
      reading_lists => {
        this.reading_lists = reading_lists;
        this.title_service.setTitle(
          this.translate_service.instant('reading-lists-page.title', {
            count: this.reading_lists.length
          })
        );
      }
    );
    this.reading_list_adaptor.get_reading_lists();
  }

  ngOnDestroy(): void {
    this.reading_lists_subscription.unsubscribe();
  }

  create_new_reading_list(): void {
    this.router.navigateByUrl('/lists/new');
  }
}
