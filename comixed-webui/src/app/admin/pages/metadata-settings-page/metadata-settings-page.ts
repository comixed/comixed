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
import {
  selectMetadataSourceListBusy,
  selectMetadataSourceListEntries
} from '@app/settings/selectors/metadata-source-list.selectors';
import { Store } from '@ngrx/store';
import { MetadataSourceListActions } from '@app/settings/actions/metadata-source-list.actions';
import { Breadcrumb } from '@openng/optimus-ui/breadcrumb';
import { Card } from '@openng/optimus-ui/card';
import { TableLazyLoadEvent, TableModule } from '@openng/optimus-ui/table';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  QUERY_PARAM_PAGE_INDEX,
  QUERY_PARAM_PAGE_SIZE
} from '@app/library/library-constants';
import { QueryParameterService } from '@app/layout/services/query-parameter.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TitleService } from '@app/layout/services/title-service';
import { MenuItem } from '@openng/optimus-ui/api';

@Component({
  imports: [Breadcrumb, Card, TableModule, TranslatePipe, RouterLink],
  selector: 'app-metadata-settings-page',
  styleUrl: './metadata-settings-page.scss',
  templateUrl: './metadata-settings-page.html'
})
export class MetadataSettingsPage implements OnInit {
  readonly logger = inject(LoggerService);
  readonly translateService = inject(TranslateService);
  readonly titleService = inject(TitleService);
  readonly queryParameterService = inject(QueryParameterService);
  readonly activatedRoute = inject(ActivatedRoute);
  readonly store = inject(Store);
  readonly metadataSourceListFirst = signal(0);
  readonly metadataSourceListRows = signal(10);
  readonly metadataSourceListBusy = this.store.selectSignal(
    selectMetadataSourceListBusy
  );
  readonly metadataSourceListEntries = this.store.selectSignal(
    selectMetadataSourceListEntries
  );

  readonly home: MenuItem = { icon: 'pi pi-home', routerLink: ['/'] };
  readonly trail = signal<MenuItem[]>([]);

  constructor() {
    this.activatedRoute.queryParams.subscribe({
      next: params => {
        const index = +params[QUERY_PARAM_PAGE_INDEX] || 0;
        const size = +params[QUERY_PARAM_PAGE_SIZE] || 10;
        this.metadataSourceListFirst.set(index * size);
        this.metadataSourceListRows.set(size);
      }
    });
    this.translateService.onLangChange.subscribe({
      next: () => {
        this.doLoadTranslations();
      }
    });
    this.doLoadTranslations();
  }

  ngOnInit(): void {
    this.logger.debug('Loading the metadata source list');
    this.store.dispatch(MetadataSourceListActions.load());
  }

  onLoad(event: TableLazyLoadEvent): void {
    this.queryParameterService.updateQueryParam([
      { name: QUERY_PARAM_PAGE_INDEX, value: `${event.first! / event.rows!}` },
      { name: QUERY_PARAM_PAGE_SIZE, value: `${event.rows!}` }
    ]);
  }

  private doLoadTranslations() {
    this.titleService.setTitle(
      this.translateService.instant('metadata-source-list-page.page-title')
    );
    this.trail.set([
      {
        label: this.translateService.instant('settings.trail-title')
      },
      {
        label: this.translateService.instant(
          'metadata-source-list-page.trail-title'
        )
      }
    ]);
  }
}
