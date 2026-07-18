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

import { AfterViewInit, Component, inject } from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import { TitleService } from '@app/core/services/title.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  selectDuplicatePageCount,
  selectDuplicatePageList,
  selectDuplicatePageListBusy
} from '@app/library/selectors/duplicate-page-list.selectors';
import { setBusyState } from '@app/core/actions/busy.actions';
import {
  duplicatePageRemoved,
  duplicatePageUpdated,
  loadDuplicatePageList
} from '@app/library/actions/duplicate-page-list.actions';
import { DuplicatePage } from '@app/library/models/duplicate-page';
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
import { SelectableListItem } from '@app/core/models/ui/selectable-list-item';
import { WebSocketService } from '@app/messaging';
import {
  DUPLICATE_PAGE_LIST_UPDATE_TOPIC,
  DUPLICATE_PAGES_UNBLOCKED_PAGES_ONLY
} from '@app/library/library.constants';
import { selectMessagingStarted } from '@app/messaging/selectors/messaging.selectors';
import { BlockedHash } from '@app/comic-pages/models/blocked-hash';
import { ConfirmationService } from '@tragically-slick/confirmation';
import { saveUserPreference } from '@app/user/actions/user.actions';
import { selectUser } from '@app/user/selectors/user.selectors';
import { getUserPreference } from '@app/user';
import * as _ from 'lodash';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import { PAGE_SIZE_OPTIONS } from '@app/core';
import { selectBlockedHashesList } from '@app/comic-pages/selectors/blocked-hashes.selectors';
import {
  setBlockedStateForHash,
  setBlockedStateForSelectedHashes
} from '@app/comic-pages/actions/blocked-hashes.actions';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DuplicatePageUpdate } from '@app/library/models/net/duplicate-page-update';
import {
  addAllHashesToSelection,
  addHashSelection,
  clearHashSelections,
  loadHashSelections,
  removeHashSelection
} from '@app/comic-pages/actions/hash-selection.actions';
import {
  selectHashSelectionBusy,
  selectHashSelectionList
} from '@app/comic-pages/selectors/hash-selection.selectors';
import { MatFabButton, MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import {
  MatCard,
  MatCardContent,
  MatCardSubtitle,
  MatCardTitle
} from '@angular/material/card';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { MatCheckbox } from '@angular/material/checkbox';
import { AsyncPipe } from '@angular/common';
import { YesNoPipe } from '../../../core/pipes/yes-no.pipe';
import { PageHashUrlPipe } from '../../../comic-books/pipes/page-hash-url.pipe';
import { tap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'cx-duplicate-page-list-page',
  templateUrl: './duplicate-page-list-page.component.html',
  styleUrls: ['./duplicate-page-list-page.component.scss'],
  imports: [
    MatFabButton,
    MatTooltip,
    MatIcon,
    MatCard,
    MatCardTitle,
    MatCardSubtitle,
    MatCardContent,
    MatPaginator,
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCheckbox,
    MatCellDef,
    MatCell,
    MatSortHeader,
    MatIconButton,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    RouterLink,
    AsyncPipe,
    YesNoPipe,
    PageHashUrlPipe,
    TranslateModule
  ]
})
export class DuplicatePageListPageComponent implements AfterViewInit {
  dataSource = new MatTableDataSource<SelectableListItem<DuplicatePage>>([]);

  totalPages$ = new BehaviorSubject(0);
  blockedHashList$ = new BehaviorSubject<BlockedHash[]>([]);
  selectedHashes$ = new BehaviorSubject<string[]>([]);
  hashSelectionBusy$ = new BehaviorSubject(false);
  allSelected$ = new BehaviorSubject(false);
  showPopup$ = new BehaviorSubject(false);
  popupPage$ = new BehaviorSubject<DuplicatePage | null>(null);
  readonly displayColumns = [
    'selection',
    'thumbnail',
    'hash',
    'comic-count',
    'blocked',
    'actions'
  ];

  logger = inject(LoggerService);
  activatedRoute = inject(ActivatedRoute);
  store = inject(Store);
  titleService = inject(TitleService);
  translateService = inject(TranslateService);
  confirmationService = inject(ConfirmationService);
  webSocketService = inject(WebSocketService);
  queryParameterService = inject(QueryParameterService);
  protected readonly PAGE_SIZE_OPTIONS = PAGE_SIZE_OPTIONS;

  constructor() {
    this.activatedRoute.queryParams
      .pipe(
        tap(() =>
          this.store.dispatch(
            loadDuplicatePageList({
              page: this.queryParameterService.pageIndex$.value,
              size: this.queryParameterService.pageSize$.value,
              sortBy: this.queryParameterService.sortBy$.value,
              sortDirection: this.queryParameterService.sortDirection$.value
            })
          )
        )
      )
      .subscribe();
    this.store
      .select(selectUser)
      .pipe(
        tap(user => {
          this.unblockedOnly =
            getUserPreference(
              user.preferences,
              DUPLICATE_PAGES_UNBLOCKED_PAGES_ONLY,
              `${false}`
            ) === `${true}`;
        })
      )
      .subscribe();
    this.store
      .select(selectDuplicatePageList)
      .pipe(tap(pages => (this.duplicatePages = pages)))
      .subscribe();
    this.store
      .select(selectDuplicatePageCount)
      .pipe(tap(count => this.totalPages$.next(count)))
      .subscribe();
    this.store
      .select(selectDuplicatePageListBusy)
      .pipe(
        tap(enabled => {
          this.store.dispatch(setBusyState({ enabled }));
        })
      )
      .subscribe();
    this.store
      .select(selectBlockedHashesList)
      .pipe(tap(blockedPages => this.blockedHashList$.next(blockedPages)))
      .subscribe();
    this.store
      .select(selectHashSelectionList)
      .pipe(
        tap(hashes => {
          this.logger.debug('Updating selected hash state:', hashes);
          this.selectedHashes$.next(hashes);
          this.updateSelectionState();
        })
      )
      .subscribe();
    this.store
      .select(selectHashSelectionBusy)
      .pipe(tap(busy => this.hashSelectionBusy$.next(busy)))
      .subscribe();
    this.translateService.onLangChange
      .pipe(tap(() => this.loadTranslations()))
      .subscribe();
    this.store
      .select(selectMessagingStarted)
      .pipe(
        tap(started => {
          this.webSocketService.subscribe(
            DUPLICATE_PAGE_LIST_UPDATE_TOPIC,
            (response: DuplicatePageUpdate) => {
              this.logger.trace('Duplicate page update received:', response);
              if (response.removed) {
                this.store.dispatch(
                  duplicatePageRemoved({
                    page: response.page,
                    total: response.total
                  })
                );
              } else {
                this.store.dispatch(
                  duplicatePageUpdated({
                    page: response.page,
                    total: response.total
                  })
                );
              }
            }
          );
        })
      )
      .subscribe();
  }

  get selectedCount(): number {
    return this.selectedHashes$.value.length;
  }

  private _unblockedOnly = false;

  get unblockedOnly(): boolean {
    return this._unblockedOnly;
  }

  set unblockedOnly(unblockedOnly: boolean) {
    this._unblockedOnly = unblockedOnly;
    this.loadDataSource();
  }

  private _duplicatePages: DuplicatePage[] = [];

  get duplicatePages(): DuplicatePage[] {
    return this._duplicatePages;
  }

  set duplicatePages(pages: DuplicatePage[]) {
    this._duplicatePages = structuredClone(pages);
    this.loadDataSource();
  }

  ngAfterViewInit(): void {
    this.store.dispatch(loadHashSelections());
    this.loadTranslations();
  }

  onBlockPage(row: SelectableListItem<DuplicatePage>): void {
    const hash = row.item.hash;
    this.logger.trace('Prompting to block page:', hash);
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'blocked-hash.add-page-hash.confirmation-title'
      ),
      message: this.translateService.instant(
        'blocked-hash.add-page-hash.confirmation-message',
        { hash }
      ),
      confirm: () => {
        this.logger.trace('Blocking all pages with hash:', hash);
        this.store.dispatch(
          setBlockedStateForHash({ hashes: [hash], blocked: true })
        );
      }
    });
  }

  onUnblockPage(row: SelectableListItem<DuplicatePage>): void {
    const hash = row.item.hash;
    this.logger.trace('Prompting to unblock page hash:', hash);
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'blocked-hash.remove-page-hash.confirmation-title'
      ),
      message: this.translateService.instant(
        'blocked-hash.remove-page-hash.confirmation-message',
        { hash }
      ),
      confirm: () => {
        this.logger.trace('Unblocking all pages with hash:', hash);
        this.store.dispatch(
          setBlockedStateForHash({ hashes: [hash], blocked: false })
        );
      }
    });
  }

  onSelectAll(checked: boolean): void {
    if (checked) {
      this.logger.trace('Selecting all duplicate pages');
      this.store.dispatch(addAllHashesToSelection());
    } else {
      this.logger.trace('Clearing hash selection');
      this.store.dispatch(clearHashSelections());
    }
  }

  onSelectOne(row: SelectableListItem<DuplicatePage>, checked: boolean): void {
    this.logger.debug('Toggling selected state for row:', row, checked);
    if (checked) {
      this.store.dispatch(addHashSelection({ hash: row.item.hash }));
    } else {
      this.store.dispatch(removeHashSelection({ hash: row.item.hash }));
    }
  }

  onBlockSelected(): void {
    this.logger.trace('Confirming blocking selected items');
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'duplicate-pages.block-selection.confirmation-title'
      ),
      message: this.translateService.instant(
        'duplicate-pages.block-selection.confirmation-message',
        { count: this.selectedHashes$.value.length }
      ),
      confirm: () => {
        this.logger.trace('Blocking selected page hashes');
        this.store.dispatch(
          setBlockedStateForSelectedHashes({
            blocked: true
          })
        );
      }
    });
  }

  onUnblockSelected(): void {
    this.logger.trace('Confirming unblocking selected items');
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'duplicate-pages.unblock-selection.confirmation-title'
      ),
      message: this.translateService.instant(
        'duplicate-pages.unblock-selection.confirmation-message',
        { count: this.selectedHashes$.value.length }
      ),
      confirm: () => {
        this.logger.trace('Unblocking selected page hashes');
        this.store.dispatch(
          setBlockedStateForSelectedHashes({
            blocked: false
          })
        );
      }
    });
  }

  onToggleUnblockedOnly(): void {
    this.store.dispatch(
      saveUserPreference({
        name: DUPLICATE_PAGES_UNBLOCKED_PAGES_ONLY,
        value: `${!this.unblockedOnly}`
      })
    );
  }

  isBlocked(item: SelectableListItem<DuplicatePage>): boolean {
    return this.blockedHashList$.value
      .map(entry => entry.hash)
      .includes(item.item.hash);
  }

  onShowPagePopup(showPopup: boolean, page: DuplicatePage) {
    this.popupPage$.next(page);
    this.showPopup$.next(showPopup);
  }

  private loadDataSource(): void {
    this.logger.info('Loading duplicate pages:', this.unblockedOnly);
    const blockedHashes = this.blockedHashList$.value.map(page => page.hash);
    this.dataSource.data = this.duplicatePages
      .filter(page => !this.unblockedOnly || !blockedHashes.includes(page.hash))
      .map(page => {
        return {
          item: page,
          selected: this.selectedHashes$.value.includes(page.hash)
        };
      });
    this.updateSelectionState();
  }

  private loadTranslations(): void {
    this.titleService.setTitle(
      this.translateService.instant('duplicate-pages.list-page.tab-title')
    );
  }

  private updateSelectionState(): void {
    this.dataSource.data.forEach(
      entry =>
        (entry.selected = this.selectedHashes$.value.includes(entry.item.hash))
    );
    /* istanbul ignore next */
    this.allSelected$.next(
      this.totalPages$.value > 0 &&
        this.totalPages$.value === this.selectedCount
    );
  }
}
