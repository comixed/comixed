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
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { Subscription } from 'rxjs';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import { TitleService } from '@app/core/services/title.service';
import { TranslateService } from '@ngx-translate/core';
import {
  selectDuplicatePageList,
  selectDuplicatePageListState
} from '@app/library/selectors/duplicate-page-list.selectors';
import { setBusyState } from '@app/core/actions/busy.actions';
import {
  duplicatePagesLoaded,
  loadDuplicatePages
} from '@app/library/actions/duplicate-page-list.actions';
import { DuplicatePage } from '@app/library/models/duplicate-page';
import { MatTableDataSource } from '@angular/material/table';
import { SelectableListItem } from '@app/core/models/ui/selectable-list-item';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { ComicDetailListDialogComponent } from '@app/library/components/comic-detail-list-dialog/comic-detail-list-dialog.component';
import { MatSort } from '@angular/material/sort';
import { setBlockedState } from '@app/comic-pages/actions/block-page.actions';
import { MessagingSubscription, WebSocketService } from '@app/messaging';
import {
  DUPLICATE_PAGE_LIST_TOPIC,
  DUPLICATE_PAGES_UNBLOCKED_PAGES_ONLY
} from '@app/library/library.constants';
import { selectMessagingState } from '@app/messaging/selectors/messaging.selectors';
import { BlockedHash } from '@app/comic-pages/models/blocked-hash';
import { selectBlockedPageList } from '@app/comic-pages/selectors/blocked-hash-list.selectors';
import { ConfirmationService } from '@tragically-slick/confirmation';
import { saveUserPreference } from '@app/user/actions/user.actions';
import { selectUser } from '@app/user/selectors/user.selectors';
import { getUserPreference } from '@app/user';
import * as _ from 'lodash';
import { ComicDetail } from '@app/comic-books/models/comic-detail';
import { selectComicBookList } from '@app/comic-books/selectors/comic-book-list.selectors';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import { PAGE_SIZE_OPTIONS } from '@app/core';

@Component({
  selector: 'cx-duplicate-page-list-page',
  templateUrl: './duplicate-page-list-page.component.html',
  styleUrls: ['./duplicate-page-list-page.component.scss']
})
export class DuplicatePageListPageComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  dataSource = new MatTableDataSource<SelectableListItem<DuplicatePage>>([]);
  langChangeSubscription: Subscription;
  duplicatePageSubscription: Subscription;
  duplicatePageStateSubscription: Subscription;
  blockedPageListSubscription: Subscription;
  blockedPages: BlockedHash[] = [];
  messagingStateSubscription: Subscription;
  pageUpdatesSubscription: MessagingSubscription;
  allSelected = false;
  anySelected = false;
  userSubscription: Subscription;
  comicsSubscription: Subscription;
  comics: ComicDetail[] = [];
  readonly displayColumns = [
    'selection',
    'thumbnail',
    'hash',
    'comic-count',
    'blocked',
    'actions'
  ];

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private titleService: TitleService,
    private translateService: TranslateService,
    private dialog: MatDialog,
    private confirmationService: ConfirmationService,
    private webSocketService: WebSocketService,
    public queryParameterService: QueryParameterService
  ) {
    this.logger.trace('Subscribing to duplicate page list changes');
    this.userSubscription = this.store.select(selectUser).subscribe(user => {
      this.unblockedOnly =
        getUserPreference(
          user.preferences,
          DUPLICATE_PAGES_UNBLOCKED_PAGES_ONLY,
          `${false}`
        ) == `${true}`;
    });
    this.duplicatePageSubscription = this.store
      .select(selectDuplicatePageList)
      .subscribe(pages => (this.duplicatePages = pages));
    this.logger.trace('Subscribing to duplicate page state changes');
    this.duplicatePageStateSubscription = this.store
      .select(selectDuplicatePageListState)
      .subscribe(state => {
        this.store.dispatch(setBusyState({ enabled: state.loading }));
      });
    this.logger.trace('Subscribing to blocked page list');
    this.blockedPageListSubscription = this.store
      .select(selectBlockedPageList)
      .subscribe(blockedPages => (this.blockedPages = blockedPages));
    this.logger.trace('Subscribing to language changes');
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.messagingStateSubscription = this.store
      .select(selectMessagingState)
      .subscribe(state => {
        if (state.started && !this.pageUpdatesSubscription) {
          this.logger.trace('Subscribing to duplicate page list updates');
          this.pageUpdatesSubscription = this.webSocketService.subscribe(
            DUPLICATE_PAGE_LIST_TOPIC,
            (pages: DuplicatePage[]) => {
              this.logger.trace('Duplicate page update received:', pages);
              this.store.dispatch(duplicatePagesLoaded({ pages }));
            }
          );
        }
      });
    this.comicsSubscription = this.store
      .select(selectComicBookList)
      .subscribe(comics => (this.comics = comics));
  }

  get selectedCount(): number {
    return this.dataSource.data.filter(entry => entry.selected).length;
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

  ngOnInit(): void {
    this.store.dispatch(loadDuplicatePages());
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (data, sortHeaderId) => {
      switch (sortHeaderId) {
        case 'selection':
          return `${data.selected}`;
        case 'hash':
          return data.item.hash;
        case 'comic-count':
          return data.item.comics.length;
        case 'blocked':
          return `${this.isBlocked(data)}`;
      }
    };
    this.loadTranslations();
  }

  ngOnDestroy(): void {
    this.duplicatePageSubscription.unsubscribe();
    this.duplicatePageStateSubscription.unsubscribe();
    this.blockedPageListSubscription.unsubscribe();
    this.langChangeSubscription.unsubscribe();
    if (!!this.pageUpdatesSubscription) {
      this.logger.trace('Unsubscribing from duplicate page list updates');
      this.pageUpdatesSubscription.unsubscribe();
      this.pageUpdatesSubscription = null;
    }
    this.comicsSubscription.unsubscribe();
  }

  onShowComicBooksWithPage(row: SelectableListItem<DuplicatePage>): void {
    this.logger.trace('Displaying dialog of affected comics');
    this.dialog.open(ComicDetailListDialogComponent, {
      data: this.comics.filter(comic => row.item.comics.includes(comic))
    });
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
        this.store.dispatch(setBlockedState({ hashes: [hash], blocked: true }));
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
          setBlockedState({ hashes: [hash], blocked: false })
        );
      }
    });
  }

  onSelectAll(checked: boolean): void {
    this.logger.trace('Selecting all duplicate pages');
    this.dataSource.data.forEach(entry => (entry.selected = checked));
    this.updateSelectionState();
  }

  onSelectOne(row: SelectableListItem<DuplicatePage>, checked: boolean): void {
    this.logger.trace('Toggling selected state for row:', row, checked);
    row.selected = checked;
    this.updateSelectionState();
  }

  onBlockSelected(): void {
    this.logger.trace('Confirming blocking selected items');
    const selection = this.dataSource.data
      .filter(entry => entry.selected)
      .map(entry => entry.item);
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'duplicate-pages.block-selection.confirmation-title'
      ),
      message: this.translateService.instant(
        'duplicate-pages.block-selection.confirmation-message',
        { count: selection.length }
      ),
      confirm: () => {
        this.logger.trace('Blocking selected page hashes');
        this.doSetBlockedState(
          selection.map(entry => entry.hash),
          true
        );
      }
    });
  }

  onUnblockSelected(): void {
    this.logger.trace('Confirming unblocking selected items');
    const selection = this.dataSource.data
      .filter(entry => entry.selected)
      .map(entry => entry.item);
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'duplicate-pages.unblock-selection.confirmation-title'
      ),
      message: this.translateService.instant(
        'duplicate-pages.unblock-selection.confirmation-message',
        { count: selection.length }
      ),
      confirm: () => {
        this.logger.trace('Unblocking selected page hashes');
        this.doSetBlockedState(
          selection.map(entry => entry.hash),
          false
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

  private loadDataSource(): void {
    this.logger.info('Loading duplicate pages:', this.unblockedOnly);
    const oldData = this.dataSource.data;
    const blockedHashes = this.blockedPages.map(page => page.hash);
    this.dataSource.data = this.duplicatePages
      .filter(page => !this.unblockedOnly || !blockedHashes.includes(page.hash))
      .map(page => {
        const existingPage = oldData.find(
          oldPage => oldPage.item.hash === page.hash
        );

        return {
          item: page,
          selected: existingPage?.selected || false
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
    this.allSelected =
      this.dataSource.data.length > 0 &&
      this.dataSource.data.every(entry => entry.selected);
    this.anySelected =
      this.allSelected || this.dataSource.data.some(entry => entry.selected);
  }

  private isBlocked(item: SelectableListItem<DuplicatePage>): boolean {
    return this.blockedPages.map(entry => entry.hash).includes(item.item.hash);
  }

  private doSetBlockedState(hashes: string[], blocked: boolean): void {
    this.store.dispatch(
      setBlockedState({
        hashes,
        blocked
      })
    );
    this.dataSource.data.forEach(item => (item.selected = false));
  }

  protected readonly PAGE_SIZE_OPTIONS = PAGE_SIZE_OPTIONS;
}
