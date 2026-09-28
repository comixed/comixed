/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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

import { Component, inject, OnInit, signal } from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { TitleService } from '@app/layout/services/title-service';
import { TableLazyLoadEvent, TableModule } from '@openng/optimus-ui/table';
import { Card } from '@openng/optimus-ui/card';
import { Breadcrumb } from '@openng/optimus-ui/breadcrumb';
import { MenuItem } from '@openng/optimus-ui/api';
import { Store } from '@ngrx/store';
import { PublisherListActions } from '@app/library/actions/publisher-list.actions';
import {
  selectPublisherList,
  selectPublisherListLoading,
  selectPublisherListTotal
} from '@app/library/selectors/publisher-list.selectors';

@Component({
  imports: [TranslatePipe, TableModule, Card, Breadcrumb],
  selector: 'app-publisher-list-page',
  styleUrl: './publisher-list-page.scss',
  templateUrl: './publisher-list-page.html'
})
export class PublisherListPage implements OnInit {
  readonly logger = inject(LoggerService);
  readonly translateService = inject(TranslateService);
  readonly titleService = inject(TitleService);
  readonly trail = signal<MenuItem[]>([]);

  readonly store = inject(Store);
  readonly loading = this.store.selectSignal(selectPublisherListLoading);
  readonly publisherList = this.store.selectSignal(selectPublisherList);
  readonly total = this.store.selectSignal(selectPublisherListTotal);

  home: MenuItem = { icon: 'pi pi-home', routerLink: ['/'] };

  constructor() {
    this.translateService.onLangChange.subscribe({
      next: () => {
        this.doLoadTranslations();
      }
    });
    this.doLoadTranslations();
  }

  ngOnInit(): void {
    this.doLoadPublishers({ page: 0, size: 10 });
  }

  onLoad(event: TableLazyLoadEvent): void {
    this.doLoadPublishers({
      page: event.first! / event.rows!,
      size: event.rows!
    });
  }

  private doLoadTranslations() {
    this.titleService.setTitle(
      this.translateService.instant(
        'collections.publisher-list-page.page-title'
      )
    );
    this.trail.set([
      { label: this.translateService.instant('publisher-list-page.page-title') }
    ]);
  }

  private doLoadPublishers(args: { page: number; size: number }) {
    this.logger.trace('Loading publisher list:', args);
    this.store.dispatch(
      PublisherListActions.load({
        searchText: '',
        page: args.page,
        size: args.size,
        sortBy: '',
        sortDirection: ''
      })
    );
  }
}
