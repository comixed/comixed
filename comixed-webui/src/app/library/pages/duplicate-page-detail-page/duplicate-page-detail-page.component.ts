/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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
  OnInit,
  ViewChild
} from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TitleService } from '@app/core/services/title.service';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { loadDuplicatePageDetail } from '@app/library/actions/duplicate-page-detail.actions';
import {
  selectDuplicatePageDetail,
  selectDuplicatePageDetailBusy,
  selectDuplicatePageDetailNotFound
} from '@app/library/selectors/duplicate-page-detail.selectors';
import { setBusyState } from '@app/core/actions/busy.actions';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
  MatTableDataSource
} from '@angular/material/table';
import { DuplicatePage } from '@app/library/models/duplicate-page';
import { filter, tap } from 'rxjs/operators';
import { ConfirmationService } from '@tragically-slick/confirmation';
import { ComicDetail } from '@app/comic-books/models/comic-detail';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import {
  loadBlockedHashList,
  setBlockedStateForHash
} from '@app/comic-pages/actions/blocked-hashes.actions';
import { selectBlockedHashesList } from '@app/comic-pages/selectors/blocked-hashes.selectors';
import { MatFabButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { ComicPageComponent } from '../../../comic-books/components/comic-page/comic-page.component';
import { AsyncPipe, DatePipe } from '@angular/common';
import { PageHashUrlPipe } from '../../../comic-books/pipes/page-hash-url.pipe';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'cx-duplicate-page-detail-page',
  templateUrl: './duplicate-page-detail-page.component.html',
  styleUrls: ['./duplicate-page-detail-page.component.scss'],
  imports: [
    MatFabButton,
    MatTooltip,
    MatIcon,
    ComicPageComponent,
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatSortHeader,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    RouterLink,
    AsyncPipe,
    DatePipe,
    PageHashUrlPipe,
    TranslateModule
  ]
})
export class DuplicatePageDetailPageComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort) sort: MatSort;

  readonly displayedColumns = [
    'publisher',
    'series',
    'volume',
    'issue-number',
    'cover-date',
    'added-date'
  ];

  dataSource = new MatTableDataSource<ComicDetail>([]);
  blockedHashes$ = new BehaviorSubject<string[]>([]);
  hash$ = new BehaviorSubject('');

  logger = inject(LoggerService);
  activatedRoute = inject(ActivatedRoute);
  router = inject(Router);
  store = inject(Store);
  titleService = inject(TitleService);
  translateService = inject(TranslateService);
  confirmationService = inject(ConfirmationService);
  queryParameterService = inject(QueryParameterService);

  constructor() {
    this.activatedRoute.params
      .pipe(
        tap(params => {
          this.hash$.next(params.hash);
          this.logger.trace('Loading duplicate page detail:', this.hash$.value);
          this.store.dispatch(
            loadDuplicatePageDetail({ hash: this.hash$.value })
          );
        })
      )
      .subscribe();
    this.store
      .select(selectDuplicatePageDetailNotFound)
      .pipe(
        tap(notFound => {
          this.logger.trace('Duplicate page state changed:', notFound);
          if (notFound) {
            this.logger.trace(
              'Page hash not found: redirecting to duplicate page list'
            );
            this.router.navigateByUrl('/library/pages/duplicates');
          }
        })
      )
      .subscribe();
    this.store
      .select(selectDuplicatePageDetailBusy)
      .pipe(tap(enabled => this.store.dispatch(setBusyState({ enabled }))))
      .subscribe();
    this.store
      .select(selectDuplicatePageDetail)
      .pipe(
        filter(detail => !!detail),
        tap(detail => (this.detail = detail))
      )
      .subscribe();
    this.store
      .select(selectBlockedHashesList)
      .pipe(
        tap(blockedHashes =>
          this.blockedHashes$.next(blockedHashes.map(hash => hash.hash))
        )
      )
      .subscribe();
    this.translateService.onLangChange
      .pipe(tap(() => this.loadTranslation()))
      .subscribe();
  }

  private _detail: DuplicatePage;

  get detail(): DuplicatePage {
    return this._detail;
  }

  set detail(detail: DuplicatePage) {
    this.logger.trace('Setting duplicate page detail');
    this._detail = detail;
    this.logger.trace('Loading affected comics:', detail);
    this.dataSource.data = this._detail.comics;
  }

  ngOnInit() {
    this.logger.trace('Loading blocked hash list');
    this.store.dispatch(loadBlockedHashList());
  }

  ngAfterViewInit(): void {
    this.logger.trace('Setting up table sorting');
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (data, sortHeaderId) => {
      switch (sortHeaderId) {
        case 'publisher':
          return data.publisher;
        case 'series':
          return data.series;
        case 'issue-number':
          return data.issueNumber;
        case 'cover-date':
        default:
          return data.coverDate;
      }
    };
    this.loadTranslation();
  }

  onBlockPage(): void {
    this.logger.trace('Confirming blocking duplicate page');
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'duplicate-page-detail.block-page.confirmation-title'
      ),
      message: this.translateService.instant(
        'duplicate-page-detail.block-page.confirmation-message'
      ),
      confirm: () => {
        this.logger.trace('Dispatching action to block page');
        this.store.dispatch(
          setBlockedStateForHash({ hashes: [this.hash$.value], blocked: true })
        );
      }
    });
  }

  onUnblockPage(): void {
    this.logger.trace('Confirming unblocking duplicate page');
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'duplicate-page-detail.unblock-page.confirmation-title'
      ),
      message: this.translateService.instant(
        'duplicate-page-detail.unblock-page.confirmation-message'
      ),
      confirm: () => {
        this.logger.trace('Dispatching action to unblock page');
        this.store.dispatch(
          setBlockedStateForHash({ hashes: [this.hash$.value], blocked: false })
        );
      }
    });
  }

  private loadTranslation(): void {
    this.titleService.setTitle(
      this.translateService.instant('duplicate-page-detail.tab-title', {
        hash: this.hash$.value
      })
    );
  }
}
