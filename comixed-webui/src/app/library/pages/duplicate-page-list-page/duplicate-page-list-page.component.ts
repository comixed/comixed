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

import { AfterViewInit, Component, inject, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import { TitleService } from '@app/core/services/title.service';
import { TranslateService } from '@ngx-translate/core';
import {
  selectDuplicatePageCount,
  selectDuplicatePageList,
  selectDuplicatePageListState
} from '@app/library/selectors/duplicate-page-list.selectors';
import { setBusyState } from '@app/core/actions/busy.actions';
import {
  duplicatePageRemoved,
  duplicatePageUpdated,
  loadDuplicatePageList
} from '@app/library/actions/duplicate-page-list.actions';
import { DuplicatePage } from '@app/library/models/duplicate-page';
import { MatTableDataSource } from '@angular/material/table';
import { SelectableListItem } from '@app/core/models/ui/selectable-list-item';
import { MessagingSubscription, WebSocketService } from '@app/messaging';
import {
  DUPLICATE_PAGE_LIST_UPDATE_TOPIC,
  DUPLICATE_PAGES_UNBLOCKED_PAGES_ONLY
} from '@app/library/library.constants';
import { selectMessagingState } from '@app/messaging/selectors/messaging.selectors';
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
import { ActivatedRoute } from '@angular/router';
import { DuplicatePageUpdate } from '@app/library/models/net/duplicate-page-update';
import {
  addAllHashesToSelection,
  addHashSelection,
  clearHashSelections,
  loadHashSelections,
  removeHashSelection
} from '@app/comic-pages/actions/hash-selection.actions';
import {
  selectHashSelectionList,
  selectHashSelectionState
} from '@app/comic-pages/selectors/hash-selection.selectors';

@Component({
  selector: 'cx-duplicate-page-list-page',
  templateUrl: './duplicate-page-list-page.component.html',
  styleUrls: ['./duplicate-page-list-page.component.scss'],
  standalone: false
})
export class DuplicatePageListPageComponent
  implements OnDestroy, AfterViewInit
{
  dataSource = new MatTableDataSource<SelectableListItem<DuplicatePage>>([]);

  langChangeSubscription: Subscription;
  queryParamsSubscription: Subscription;
  duplicatePageListSubscription: Subscription;
  duplicatePageCountSubscription: Subscription;
  totalPages = 0;
  duplicatePageStateSubscription: Subscription;
  blockedHashListSubscription: Subscription;
  blockedHashList: BlockedHash[] = [];
  messagingStateSubscription: Subscription;
  pageUpdatesSubscription: MessagingSubscription;
  hashSelectionStateSubscription: Subscription;
  selectedHashes: string[] = [];
  hashSelectionBusy = false;
  hashSelectionListSubscription: Subscription;
  allSelected = false;
  anySelected = false;
  userSubscription: Subscription;
  showPopup = false;
  popupPage: DuplicatePage | null = null;
  readonly displayColumns = [
    'selection',
    'thumbnail',
    'hash',
    'comic-count',
    'blocked',
    'actions'
  ];
  protected readonly PAGE_SIZE_OPTIONS = PAGE_SIZE_OPTIONS;

  logger = inject(LoggerService);
  activatedRoute = inject(ActivatedRoute);
  store = inject(Store);
  titleService = inject(TitleService);
  translateService = inject(TranslateService);
  confirmationService = inject(ConfirmationService);
  webSocketService = inject(WebSocketService);
  queryParameterService = inject(QueryParameterService);

  constructor() {
    this.queryParamsSubscription = this.activatedRoute.queryParams.subscribe(
      params =>
        this.store.dispatch(
          loadDuplicatePageList({
            page: this.queryParameterService.pageIndex$.value,
            size: this.queryParameterService.pageSize$.value,
            sortBy: this.queryParameterService.sortBy$.value,
            sortDirection: this.queryParameterService.sortDirection$.value
          })
        )
    );
    this.logger.trace('Subscribing to duplicate page list changes');
    this.userSubscription = this.store.select(selectUser).subscribe(user => {
      this.unblockedOnly =
        getUserPreference(
          user.preferences,
          DUPLICATE_PAGES_UNBLOCKED_PAGES_ONLY,
          `${false}`
        ) == `${true}`;
    });
    this.duplicatePageListSubscription = this.store
      .select(selectDuplicatePageList)
      .subscribe(pages => (this.duplicatePages = pages));
    this.duplicatePageCountSubscription = this.store
      .select(selectDuplicatePageCount)
      .subscribe(count => (this.totalPages = count));
    this.logger.trace('Subscribing to duplicate page state changes');
    this.duplicatePageStateSubscription = this.store
      .select(selectDuplicatePageListState)
      .subscribe(state => {
        this.store.dispatch(setBusyState({ enabled: state.loading }));
      });
    this.logger.trace('Subscribing to blocked page list');
    this.blockedHashListSubscription = this.store
      .select(selectBlockedHashesList)
      .subscribe(blockedPages => (this.blockedHashList = blockedPages));
    this.logger.trace('Subscribing to hash selection state updates');
    this.hashSelectionStateSubscription = this.store
      .select(selectHashSelectionState)
      .subscribe(state => (this.hashSelectionBusy = state.busy));
    this.logger.trace('Subscribing to hash selection updates');
    this.hashSelectionListSubscription = this.store
      .select(selectHashSelectionList)
      .subscribe(hashes => {
        this.logger.debug('Updating selected hash state:', hashes);
        this.selectedHashes = hashes;
        this.updateSelectionState();
      });
    this.logger.trace('Subscribing to language changes');
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.messagingStateSubscription = this.store
      .select(selectMessagingState)
      .subscribe(state => {
        if (state.started) {
          if (!this.pageUpdatesSubscription) {
            this.logger.trace('Subscribing to duplicate page list updates');
            this.pageUpdatesSubscription = this.webSocketService.subscribe(
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
          }
        }
      });
  }

  get selectedCount(): number {
    return this.selectedHashes.length;
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
    this._duplicatePages = _.cloneDeep(pages);
    this.loadDataSource();
  }

  ngAfterViewInit(): void {
    this.store.dispatch(loadHashSelections());
    this.loadTranslations();
  }

  ngOnDestroy(): void {
    this.duplicatePageListSubscription.unsubscribe();
    this.duplicatePageCountSubscription.unsubscribe();
    this.duplicatePageStateSubscription.unsubscribe();
    this.blockedHashListSubscription.unsubscribe();
    this.hashSelectionStateSubscription.unsubscribe();
    this.hashSelectionListSubscription.unsubscribe();
    this.langChangeSubscription.unsubscribe();
    if (!!this.pageUpdatesSubscription) {
      this.logger.trace('Unsubscribing from duplicate page list updates');
      this.pageUpdatesSubscription.unsubscribe();
      this.pageUpdatesSubscription = null;
    }
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
        { count: this.selectedHashes.length }
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
        { count: this.selectedHashes.length }
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
    return this.blockedHashList
      .map(entry => entry.hash)
      .includes(item.item.hash);
  }

  onShowPagePopup(showPopup: boolean, page: DuplicatePage) {
    this.popupPage = page;
    this.showPopup = showPopup;
  }

  private loadDataSource(): void {
    this.logger.info('Loading duplicate pages:', this.unblockedOnly);
    const blockedHashes = this.blockedHashList.map(page => page.hash);
    this.dataSource.data = this.duplicatePages
      .filter(page => !this.unblockedOnly || !blockedHashes.includes(page.hash))
      .map(page => {
        return {
          item: page,
          selected: this.selectedHashes.includes(page.hash)
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
      entry => (entry.selected = this.selectedHashes.includes(entry.item.hash))
    );
    /* istanbul ignore next */
    this.allSelected =
      this.totalPages > 0 && this.totalPages === this.selectedCount;
    /* istanbul ignore next */
    this.anySelected = this.selectedCount > 0;
  }
}
