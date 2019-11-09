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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { ReadingList, ReadingListAdaptor } from 'app/library';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { BreadcrumbAdaptor } from 'app/adaptors/breadcrumb.adaptor';

@Component({
  selector: 'app-reading-lists-page',
  templateUrl: './reading-lists-page.component.html',
  styleUrls: ['./reading-lists-page.component.scss']
})
export class ReadingListsPageComponent implements OnInit, OnDestroy {
  readingListsSubscription: Subscription;
  readingLists: ReadingList[];
  langChangeSubscription: Subscription;

  constructor(
    private titleService: Title,
    private translateService: TranslateService,
    private readingListAdaptor: ReadingListAdaptor,
    private breadcrumbAdaptor: BreadcrumbAdaptor,
    private router: Router
  ) {}

  ngOnInit() {
    this.readingListsSubscription = this.readingListAdaptor.reading_list$.subscribe(
      reading_lists => {
        this.readingLists = reading_lists;
        this.titleService.setTitle(
          this.translateService.instant('reading-lists-page.title', {
            count: this.readingLists.length
          })
        );
      }
    );
    this.readingListAdaptor.get_reading_lists();
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.loadTranslations();
  }

  ngOnDestroy(): void {
    this.readingListsSubscription.unsubscribe();
    this.langChangeSubscription.unsubscribe();
  }

  create_new_reading_list(): void {
    this.router.navigateByUrl('/lists/new');
  }

  private loadTranslations() {
    this.breadcrumbAdaptor.loadEntries([
      {
        label: this.translateService.instant(
          'breadcrumb.entry.reading-lists-page'
        )
      }
    ]);
  }
}
