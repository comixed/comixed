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

import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { TranslateService } from '@ngx-translate/core';
import { TitleService } from '@app/core/services/title.service';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { loadDuplicatePageDetail } from '@app/library/actions/duplicate-page-detail.actions';
import {
  selectDuplicatePageDetail,
  selectDuplicatePageDetailState
} from '@app/library/selectors/duplicate-page-detail.selectors';
import { setBusyState } from '@app/core/actions/busy.actions';
import { MatTableDataSource } from '@angular/material/table';
import { ComicBook } from '@app/comic-books/models/comic-book';
import { DuplicatePage } from '@app/library/models/duplicate-page';
import { filter } from 'rxjs/operators';
import { setBlockedState } from '@app/comic-pages/actions/block-page.actions';
import { ConfirmationService } from '@tragically-slick/confirmation';
import { selectBlockedPageList } from '@app/comic-pages/selectors/blocked-hash-list.selectors';
import { loadBlockedHashList } from '@app/comic-pages/actions/blocked-hash-list.actions';

@Component({
  selector: 'cx-duplicate-page-detail-page',
  templateUrl: './duplicate-page-detail-page.component.html',
  styleUrls: ['./duplicate-page-detail-page.component.scss']
})
export class DuplicatePageDetailPageComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  paramSubscription: Subscription;
  duplicatePageStateSubscription: Subscription;
  duplicatePageSubscription: Subscription;
  blockedHashesSubscription: Subscription;
  blockedHashes: string[] = [];
  langChangeSubscription: Subscription;
  hash = '';
  dataSource = new MatTableDataSource<number>([]);

  readonly displayedColumns = [
    'publisher',
    'series',
    'volume',
    'issue-number',
    'cover-date',
    'added-date'
  ];

  constructor(
    private logger: LoggerService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private store: Store<any>,
    private titleService: TitleService,
    private translateService: TranslateService,
    private confirmationService: ConfirmationService
  ) {
    this.paramSubscription = this.activatedRoute.params.subscribe(params => {
      this.hash = params.hash;
      this.logger.trace('Loading duplicate page detail:', this.hash);
      this.store.dispatch(loadDuplicatePageDetail({ hash: this.hash }));
    });
    this.duplicatePageStateSubscription = this.store
      .select(selectDuplicatePageDetailState)
      .pipe(filter(state => !!state))
      .subscribe(state => {
        this.logger.trace('Duplicate page state changed:', state);
        if (state.notFound) {
          this.logger.trace(
            'Page hash not found: redirecting to duplicate page list'
          );
          this.router.navigateByUrl('/library/pages/duplicates');
        } else {
          this.logger.trace('Updating busy state:', state.loading);
          this.store.dispatch(setBusyState({ enabled: state.loading }));
        }
      });
    this.duplicatePageSubscription = this.store
      .select(selectDuplicatePageDetail)
      .pipe(filter(detail => !!detail))
      .subscribe(detail => (this.detail = detail));
    this.blockedHashesSubscription = this.store
      .select(selectBlockedPageList)
      .subscribe(
        blockedHashes =>
          (this.blockedHashes = blockedHashes.map(hash => hash.hash))
      );
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslation()
    );
  }

  ngOnInit() {
    this.logger.trace('Loading blocked hash list');
    this.store.dispatch(loadBlockedHashList());
  }

  private _detail: DuplicatePage;

  get detail(): DuplicatePage {
    return this._detail;
  }

  set detail(detail: DuplicatePage) {
    this.logger.trace('Setting duplicate page detail');
    this._detail = detail;
    this.logger.trace('Loading affected comics');
    this.dataSource.data = this._detail.ids;
  }

  ngAfterViewInit(): void {
    this.loadTranslation();
  }

  ngOnDestroy(): void {
    this.paramSubscription.unsubscribe();
    this.duplicatePageStateSubscription.unsubscribe();
    this.duplicatePageSubscription.unsubscribe();
    this.blockedHashesSubscription.unsubscribe();
    this.langChangeSubscription.unsubscribe();
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
          setBlockedState({ hashes: [this.hash], blocked: true })
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
          setBlockedState({ hashes: [this.hash], blocked: false })
        );
      }
    });
  }

  private loadTranslation(): void {
    this.titleService.setTitle(
      this.translateService.instant('duplicate-page-detail.tab-title', {
        hash: this.hash
      })
    );
  }
}
