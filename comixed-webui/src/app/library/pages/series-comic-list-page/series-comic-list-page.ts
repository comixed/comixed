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
import { Card } from '@openng/optimus-ui/card';
import { TableModule } from '@openng/optimus-ui/table';
import { DatePipe } from '@angular/common';
import { Breadcrumb } from '@openng/optimus-ui/breadcrumb';
import { MenuItem } from '@openng/optimus-ui/api';
import { Store } from '@ngrx/store';
import {
  selectSeriesComicListBusy,
  selectSeriesComicListEntries
} from '@app/library/selectors/series-comic-list.selectors';
import { SeriesComicListActions } from '@app/library/actions/series-comic-list.actions';

@Component({
  imports: [Card, TranslatePipe, TableModule, DatePipe, Breadcrumb],
  selector: 'app-series-comic-list-page',
  styleUrl: './series-comic-list-page.scss',
  templateUrl: './series-comic-list-page.html'
})
export class SeriesComicListPage {
  readonly logger = inject(LoggerService);
  readonly store = inject(Store);
  readonly seriesComicListBusy = this.store.selectSignal(
    selectSeriesComicListBusy
  );
  readonly seriesComicListEntries = this.store.selectSignal(
    selectSeriesComicListEntries
  );
  readonly translateService = inject(TranslateService);
  readonly titleService = inject(TitleService);
  readonly activatedRoute = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly trail = signal<MenuItem[]>([]);

  publisherName = '';
  seriesName = '';
  volume = '';
  readonly home: MenuItem = { icon: 'pi pi-home', routerLink: ['/'] };

  constructor() {
    this.logger.trace('Subscribing to router parameter updates');
    this.activatedRoute.params.subscribe({
      next: params => {
        this.publisherName = params['publisherName'];
        this.seriesName = params['seriesName'];
        this.volume = params['volume'];
        this.store.dispatch(
          SeriesComicListActions.load({
            publisherName: this.publisherName,
            seriesName: this.seriesName,
            volume: this.volume
          })
        );
      }
    });
    this.translateService.onLangChange.subscribe({
      next: () => {
        this.doLoadTranslations();
      }
    });
    this.doLoadTranslations();
  }

  private doLoadTranslations() {
    this.titleService.setTitle(
      this.translateService.instant('series-comic-list-page.page-title', {
        name: this.seriesName,
        volume: this.volume
      })
    );
    this.trail.set([
      {
        label: this.translateService.instant('publisher-list-page.trail-title')
      },
      {
        label: this.publisherName,
        routerLink: ['/library/publishers', this.publisherName, 'series']
      },
      {
        label: this.translateService.instant(
          'series-comic-list-page.trail-title',
          {
            name: this.seriesName,
            volume: this.volume
          }
        )
      }
    ]);
  }
}
