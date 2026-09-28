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

import { Component, inject, signal } from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { TitleService } from '@app/layout/services/title-service';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ComicTagType,
  comicTagTypeFromString
} from '@app/library/models/comic-tag-type';
import { Card } from '@openng/optimus-ui/card';
import { TableLazyLoadEvent, TableModule } from '@openng/optimus-ui/table';
import { Breadcrumb } from '@openng/optimus-ui/breadcrumb';
import { MenuItem } from '@openng/optimus-ui/api';
import { Store } from '@ngrx/store';
import {
  selectTagListBusy,
  selectTagListEntries,
  selectTagListTotal
} from '@app/library/selectors/tag-list.selectors';
import { TagListActions } from '@app/library/actions/tag-list.actions';
import {
  QUERY_PARAM_PAGE_INDEX,
  QUERY_PARAM_PAGE_SIZE
} from '@app/library/library-constants';
import { QueryParameterService } from '@app/layout/services/query-parameter.service';

@Component({
  imports: [TranslatePipe, Card, TableModule, Breadcrumb],
  selector: 'app-tag-list-page',
  styleUrl: './tag-list-page.scss',
  templateUrl: './tag-list-page.html'
})
export class TagListPage {
  readonly logger = inject(LoggerService);
  readonly store = inject(Store);
  readonly queryParameterService = inject(QueryParameterService);
  readonly tagListBusy = this.store.selectSignal(selectTagListBusy);
  readonly tagListEntries = this.store.selectSignal(selectTagListEntries);
  readonly tagListTotal = this.store.selectSignal(selectTagListTotal);
  readonly translateService = inject(TranslateService);
  readonly titleService = inject(TitleService);
  readonly activatedRoute = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly trail = signal<MenuItem[]>([]);
  readonly tagType = signal(ComicTagType.STORY);
  readonly tagListFirst = signal(0);
  readonly tagListRows = signal(10);

  readonly home: MenuItem = { icon: 'pi pi-home', routerLink: ['/'] };

  constructor() {
    this.logger.trace('Subscribing to router parameter updates');
    this.activatedRoute.params.subscribe({
      next: data => {
        try {
          this.tagType.set(comicTagTypeFromString(data['tagType']));
        } catch (error) {
          this.logger.error('Could not determine tag type', error);
          this.router.navigateByUrl('/');
        }
      }
    });
    this.activatedRoute.queryParams.subscribe({
      next: params => {
        const index = +params[QUERY_PARAM_PAGE_INDEX] || 0;
        const size = +params[QUERY_PARAM_PAGE_SIZE] || 10;
        this.store.dispatch(
          TagListActions.load({
            tagType: this.tagType(),
            searchText: '',
            index,
            size,
            sortBy: '',
            sortDirection: ''
          })
        );
        this.tagListFirst.set(index * size);
        this.tagListRows.set(size);
      }
    });
    this.translateService.onLangChange.subscribe({
      next: () => {
        this.doLoadTranslations();
      }
    });
    this.doLoadTranslations();
  }

  onLoad(event: TableLazyLoadEvent): void {
    this.queryParameterService.updateQueryParam([
      { name: QUERY_PARAM_PAGE_INDEX, value: `${event.first! / event.rows!}` },
      { name: QUERY_PARAM_PAGE_SIZE, value: `${event.rows!}` }
    ]);
  }

  private doLoadTranslations() {
    this.titleService.setTitle(
      this.translateService.instant('tag-list-page.trail-title', {
        tagType: this.tagType()
      })
    );
    this.trail.set([
      {
        label: this.translateService.instant('tag-list-page.trail-title', {
          tagType: this.tagType()
        })
      }
    ]);
  }
}
