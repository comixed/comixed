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

import { Component, inject, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { MessagingSubscription, WebSocketService } from '@app/messaging';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import {
  createReadingList,
  loadReadingList,
  readingListLoaded,
  saveReadingList
} from '@app/lists/actions/reading-list-detail.actions';
import {
  selectReadingList,
  selectReadingListState
} from '@app/lists/selectors/reading-list-detail.selectors';
import { setBusyState } from '@app/core/actions/busy.actions';
import { ReadingList } from '@app/lists/models/reading-list';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators
} from '@angular/forms';
import { filter } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { removeSelectedComicBooksFromReadingList } from '@app/lists/actions/reading-list-entries.actions';
import { selectMessagingState } from '@app/messaging/selectors/messaging.selectors';
import {
  READING_LIST_REMOVAL_TOPIC,
  READING_LIST_UPDATES_TOPIC
} from '@app/lists/lists.constants';
import { downloadReadingList } from '@app/lists/actions/download-reading-list.actions';
import {
  deleteReadingLists,
  readingListRemoved
} from '@app/lists/actions/reading-lists.actions';
import { TitleService } from '@app/core/services/title.service';
import { ConfirmationService } from '@tragically-slick/confirmation';
import { MatTableDataSource } from '@angular/material/table';
import { SelectableListItem } from '@app/core/models/ui/selectable-list-item';
import { selectComicBookSelectionIds } from '@app/comic-books/selectors/comic-book-selection.selectors';
import { setMultipleComicBookByIdSelectionState } from '@app/comic-books/actions/comic-book-selection.actions';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import { selectReadComicBooksList } from '@app/user/selectors/read-comic-books.selectors';
import {
  loadComicsForReadingList,
  resetComicList
} from '@app/comic-books/actions/comic-list.actions';
import { selectComicList } from '@app/comic-books/selectors/comic-list.selectors';
import { DisplayableComic } from '@app/comic-books/models/displayable-comic';
import { interpolate } from '@app/core';
import { selectUser } from '@app/user/selectors/user.selectors';

@Component({
  selector: 'cx-user-reading-list-page',
  templateUrl: './reading-list-detail-page.component.html',
  styleUrls: ['./reading-list-detail-page.component.scss'],
  standalone: false
})
export class ReadingListDetailPageComponent implements OnDestroy {
  dataSource = new MatTableDataSource<SelectableListItem<DisplayableComic>>([]);

  paramsSubscription: Subscription;
  queryParamsSubscription: Subscription;
  readingListStateSubscription: Subscription;
  readingListSubscription: Subscription;
  messagingSubscription: Subscription;
  userSubscription: Subscription;
  readingListUpdateSubscription: MessagingSubscription | null = null;
  readingListRemovalSubscription: MessagingSubscription | null = null;
  selectionSubscription: Subscription;
  lastReadDataSubscription: Subscription;
  readingListForm: UntypedFormGroup;
  readingListId = -1;
  selectedIds: number[] = [];
  comicBooksRead: number[] = [];
  langChangeSubscription: Subscription;
  comicDetailListSubscription: Subscription;
  comics: DisplayableComic[] = [];
  email: string | null = null;

  logger = inject(LoggerService);
  store = inject(Store);
  webSocketService = inject(WebSocketService);
  activatedRoute = inject(ActivatedRoute);
  router = inject(Router);
  formBuilder = inject(UntypedFormBuilder);
  confirmationService = inject(ConfirmationService);
  translateService = inject(TranslateService);
  titleService = inject(TitleService);
  queryParameterService = inject(QueryParameterService);

  constructor() {
    this.logger.trace('Subscribing to parameter updates');
    this.paramsSubscription = this.activatedRoute.params.subscribe(params => {
      if (!!params.id) {
        this.readingListId = +params.id;
        this.logger.trace(
          'Firing action to load reading list by id:',
          this.readingListId
        );
        this.store.dispatch(loadReadingList({ id: this.readingListId }));
      } else {
        this.readingListId = -1;
        this.logger.trace('Resetting comic list');
        this.store.dispatch(resetComicList());
        this.logger.trace('Firing action to create a reading list');
        this.store.dispatch(createReadingList());
      }
    });
    this.logger.trace('Subscribing to query parameter updates');
    this.queryParamsSubscription = this.activatedRoute.queryParams.subscribe(
      params => this.loadReadingListEntries()
    );
    this.readingListForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(128)]],
      summary: ['']
    });
    this.logger.trace('Subscribing to reading list state updates');
    this.readingListStateSubscription = this.store
      .select(selectReadingListState)
      .subscribe(state => {
        if (state.notFound) {
          this.logger.trace('Reading list not found');
          this.router.navigateByUrl('/lists/reading/all');
        } else {
          this.store.dispatch(setBusyState({ enabled: state.loading }));
        }
      });
    this.logger.trace('Subscribing to reading list updates');
    this.readingListSubscription = this.store
      .select(selectReadingList)
      .pipe(filter(list => !!list))
      .subscribe(readingList => {
        if (this.readingListId === -1 && !!readingList.readingListId) {
          this.logger.trace('Redirecting to reading list details');
          this.router.navigate([
            '/lists',
            'reading',
            readingList.readingListId
          ]);
        } else {
          this.logger.trace('Received reading list');
          this.readingList = readingList;
          this.loadTranslations();
        }
      });
    this.logger.trace('Subscribing to comic detail list updates');
    this.comicDetailListSubscription = this.store
      .select(selectComicList)
      .subscribe(comics => {
        this.comics = comics;
        this.doLoadDataSource();
      });
    this.selectionSubscription = this.store
      .select(selectComicBookSelectionIds)
      .subscribe(selections => {
        this.selectedIds = selections;
      });
    this.logger.trace('Subscribing to last read updates');
    this.lastReadDataSubscription = this.store
      .select(selectReadComicBooksList)
      .subscribe(comicBooksRead => (this.comicBooksRead = comicBooksRead));
    this.logger.trace('Subscribing to messaging updates');
    this.messagingSubscription = this.store
      .select(selectMessagingState)
      .subscribe(state => {
        if (state.started && this.readingListId !== -1) {
          this.doSubscribeToListUpdates();
        }

        if (!state.started && !!this.readingListUpdateSubscription) {
          this.logger.trace('Unsubscribing from reading list details updates');
          this.readingListUpdateSubscription.unsubscribe();
          this.readingListUpdateSubscription = null;
        }

        if (!state.started && !!this.readingListRemovalSubscription) {
          this.logger.trace('Unsubscribing from reading list removal updates');
          this.readingListRemovalSubscription.unsubscribe();
          this.readingListRemovalSubscription = null;
        }
      });
    this.logger.trace('Subscribing to user updates');
    this.userSubscription = this.store.select(selectUser).subscribe(user => {
      this.email = user?.email;
      this.doSubscribeToListUpdates();
    });
    this.logger.trace('Subscribing to language change updates');
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
  }

  private _readingList: ReadingList;

  get readingList(): ReadingList {
    return this._readingList;
  }

  set readingList(readingList: ReadingList) {
    this._readingList = readingList;
    this.readingListForm.controls.name.setValue(readingList.name);
    this.readingListForm.controls.summary.setValue(readingList.summary);
    this.readingListForm.markAsPristine();
    this.loadReadingListEntries();
  }

  ngOnDestroy(): void {
    this.logger.trace('Unsubscribing from parameter updates');
    this.paramsSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from query parameter updates');
    this.queryParamsSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from messaging updates');
    this.messagingSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from user updates');
    this.userSubscription.unsubscribe();
    if (!!this.readingListSubscription) {
      this.logger.trace('Unsubscribing from reading list updates');
    }
    this.readingListSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from comic detail list updates');
    this.comicDetailListSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from selection updates');
    this.selectionSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from last read updates');
    this.lastReadDataSubscription.unsubscribe();
  }

  onSave(): void {
    this.logger.trace('Confirming saving reading list with user');
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'reading-list.save-changes.confirmation-title'
      ),
      message: this.translateService.instant(
        'reading-list.save-changes.confirmation-message'
      ),
      confirm: () => {
        const list = this.encodeForm();
        this.logger.trace('Firing action: save reading list:', list);
        this.store.dispatch(saveReadingList({ list }));
      }
    });
  }

  onReset(): void {
    this.logger.trace('Confirming resetting reading list form with user');
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'reading-list.undo-changes.confirmation-title'
      ),
      message: this.translateService.instant(
        'reading-list.undo-changes.confirmation-message'
      ),
      confirm: () => {
        this.logger.trace('Resetting form');
        this.readingList = this._readingList;
      }
    });
  }

  onRemoveEntries(): void {
    this.logger.trace('Confirming remove selected comics');
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'reading-list-entries.remove-comics.confirmation-title'
      ),
      message: this.translateService.instant(
        'reading-list-entries.remove-comics.confirmation-message'
      ),
      confirm: () => {
        this.logger.trace('Firing action: remove comics from reading list');
        this.store.dispatch(
          removeSelectedComicBooksFromReadingList({
            list: this.readingList
          })
        );
      }
    });
  }

  onDownload(): void {
    this.logger.trace('Downloading reading list');
    this.store.dispatch(downloadReadingList({ list: this.readingList }));
  }

  onDeleteReadingList(): void {
    this.logger.trace('Confirming deleting reading list');
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'reading-list.delete-reading-list.confirmation-title'
      ),
      message: this.translateService.instant(
        'reading-list.delete-reading-list.confirmation-message'
      ),
      confirm: () => {
        this.logger.trace('Firing action to delete reading list');
        this.store.dispatch(deleteReadingLists({ lists: [this.readingList] }));
      }
    });
  }

  onSelectAll(selected: boolean): void {
    this.logger.debug('Selecting all comics in reading list');
    this.store.dispatch(
      setMultipleComicBookByIdSelectionState({
        selected,
        comicBookIds: this.readingList.entryIds
      })
    );
  }

  private doLoadDataSource() {
    this.logger.trace('Loading comics from reading list');
    this.dataSource.data = this.comics.map(entry => {
      return {
        selected: this.selectedIds.includes(entry.comicDetailId),
        item: entry
      };
    });
  }

  private encodeForm(): ReadingList {
    return {
      ...this.readingList,
      name: this.readingListForm.controls.name.value,
      summary: this.readingListForm.controls.summary.value
    };
  }

  private loadTranslations(): void {
    /* istanbul ignore next */
    if (!!this.readingList) {
      this.logger.trace('Loading tab title');
      this.titleService.setTitle(
        this.translateService.instant('reading-list.tab-title', {
          name: this.readingList.name
        })
      );
    }
  }

  private loadReadingListEntries() {
    this.logger.trace('Loading reading list entries');
    this.store.dispatch(
      loadComicsForReadingList({
        readingListId: this.readingListId,
        pageSize: this.queryParameterService.pageSize$.value,
        pageIndex: this.queryParameterService.pageIndex$.value,
        sortBy: this.queryParameterService.sortBy$.value,
        sortDirection: this.queryParameterService.sortDirection$.value
      })
    );
  }

  private doSubscribeToListUpdates() {
    if (!!this.email) {
      if (this.readingListUpdateSubscription == null) {
        this.logger.trace('Subscribing to reading list updates');
        this.readingListUpdateSubscription = this.webSocketService.subscribe(
          interpolate(READING_LIST_UPDATES_TOPIC, {
            id: this.readingListId,
            email: this.email
          }),
          list => {
            this.logger.trace('Reading list updated received');
            this.store.dispatch(readingListLoaded({ list }));
            this.loadReadingListEntries();
          }
        );
      }
      if (this.readingListRemovalSubscription === null) {
        this.logger.trace('Subscribing to reading list removal');
        this.readingListRemovalSubscription = this.webSocketService.subscribe(
          interpolate(READING_LIST_REMOVAL_TOPIC, { email: this.email }),
          list => {
            this.logger.trace('Reading list removal received');
            this.store.dispatch(readingListRemoved({ list }));
            if (list.readingListId === this.readingListId) {
              this.logger.trace('This reading list was removed');
              this.router.navigateByUrl('/lists/reading/all');
            }
          }
        );
      }
    }
  }
}
