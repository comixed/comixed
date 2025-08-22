/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2024, The ComiXed Project
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

import {
  AfterViewInit,
  Component,
  inject,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { Subscription } from 'rxjs';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import { selectProcessingComicBooksState } from '@app/selectors/import-comic-books.selectors';
import { ProcessingComicStatus } from '@app/reducers/import-comic-books.reducer';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import { TranslateService } from '@ngx-translate/core';
import { TitleService } from '@app/core/services/title.service';

@Component({
  selector: 'cx-processing-status-page',
  templateUrl: './processing-status-page.component.html',
  styleUrls: ['./processing-status-page.component.scss'],
  standalone: false
})
export class ProcessingStatusPageComponent
  implements AfterViewInit, OnInit, OnDestroy
{
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  dataSource = new MatTableDataSource<ProcessingComicStatus>([]);

  readonly displayedColumns = ['step-name', 'processed', 'total', 'progress'];

  comicImportStateSubscription: Subscription;
  landChangeSubscription: Subscription;

  logger = inject(LoggerService);
  store = inject(Store);
  translateService = inject(TranslateService);
  titleService = inject(TitleService);
  queryParameterService = inject(QueryParameterService);

  constructor() {
    this.landChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.logger.debug('Subscribing to comic import state updates');
    this.comicImportStateSubscription = this.store
      .select(selectProcessingComicBooksState)
      .subscribe(state => (this.dataSource.data = state.batches));
  }

  ngOnInit(): void {
    this.loadTranslations();
  }

  ngOnDestroy(): void {
    this.logger.debug('Unsubscribing from comic import state updates');
    this.comicImportStateSubscription.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (data, sortHeaderId) => {
      switch (sortHeaderId) {
        case 'progress':
          return data.progress;
        case 'step-name':
        default:
          return data.stepName;
      }
    };
  }

  private loadTranslations() {
    this.titleService.setTitle(
      this.translateService.instant('processing-status-page.tab-title')
    );
  }
}
