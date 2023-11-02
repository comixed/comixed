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

import { Component, OnDestroy } from '@angular/core';
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
import { interpolate } from '@app/core';
import { downloadReadingList } from '@app/lists/actions/download-reading-list.actions';
import {
  deleteReadingLists,
  readingListRemoved
} from '@app/lists/actions/reading-lists.actions';
import { TitleService } from '@app/core/services/title.service';
import { ConfirmationService } from '@tragically-slick/confirmation';
import { ComicDetail } from '@app/comic-books/models/comic-detail';
import { MatTableDataSource } from '@angular/material/table';
import { SelectableListItem } from '@app/core/models/ui/selectable-list-item';
import { LastRead } from '@app/comic-books/models/last-read';
import { selectComicBookLastReadEntries } from '@app/comic-books/selectors/last-read-list.selectors';
import { selectComicBookSelectionIds } from '@app/comic-books/selectors/comic-book-selection.selectors';
import { setMultipleComicBookByIdSelectionState } from '@app/comic-books/actions/comic-book-selection.actions';

@Component({
  selector: 'cx-user-reading-list-page',
  templateUrl: './reading-list-detail-page.component.html',
  styleUrls: ['./reading-list-detail-page.component.scss']
})
export class ReadingListDetailPageComponent implements OnDestroy {
  dataSource = new MatTableDataSource<SelectableListItem<ComicDetail>>([]);

  paramsSubscription: Subscription;
  readingListStateSubscription: Subscription;
  readingListSubscription: Subscription;
  messagingSubscription: Subscription;
  readingListUpdateSubscription: MessagingSubscription;
  readingListRemovalSubscription: MessagingSubscription;
  selectionSubscription: Subscription;
  lastReadDataSubscription: Subscription;
  readingListForm: UntypedFormGroup;
  readingListId = -1;
  selectedIds: number[] = [];
  lastReadDates: LastRead[] = [];
  langChangeSubscription: Subscription;

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private webSocketService: WebSocketService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private formBuilder: UntypedFormBuilder,
    private confirmationService: ConfirmationService,
    private translateService: TranslateService,
    private titleService: TitleService
  ) {
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
        this.logger.trace('Firing action to create a reading list');
        this.store.dispatch(createReadingList());
      }
    });
    this.readingListForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(128)]],
      summary: ['']
    });
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
    this.readingListSubscription = this.store
      .select(selectReadingList)
      .pipe(filter(list => !!list))
      .subscribe(readingList => {
        if (this.readingListId === -1 && !!readingList.id) {
          this.logger.trace('Redirecting to reading list details');
          this.router.navigate(['/lists', 'reading', readingList.id]);
        } else {
          this.logger.trace('Received reading list');
          this.readingList = readingList;
          this.loadTranslations();
        }
      });
    this.selectionSubscription = this.store
      .select(selectComicBookSelectionIds)
      .subscribe(selections => {
        this.selectedIds = selections;
      });
    this.lastReadDataSubscription = this.store
      .select(selectComicBookLastReadEntries)
      .subscribe(lastReadDates => (this.lastReadDates = lastReadDates));
    this.messagingSubscription = this.store
      .select(selectMessagingState)
      .subscribe(state => {
        if (
          state.started &&
          this.readingListId !== -1 &&
          !this.readingListUpdateSubscription
        ) {
          this.logger.trace('Subscribing to reading list updates');
          this.readingListUpdateSubscription = this.webSocketService.subscribe(
            interpolate(READING_LIST_UPDATES_TOPIC, {
              id: this.readingListId
            }),
            list => {
              this.logger.trace('Reading list updated received');
              this.store.dispatch(readingListLoaded({ list }));
            }
          );
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

        if (
          state.started &&
          this.readingListId !== -1 &&
          !this.readingListRemovalSubscription
        ) {
          this.logger.trace('Subscribing to reading list removal');
          this.readingListRemovalSubscription = this.webSocketService.subscribe(
            READING_LIST_REMOVAL_TOPIC,
            list => {
              this.logger.trace('Reading list removal received');
              this.store.dispatch(readingListRemoved({ list }));
              if (list.id === this.readingListId) {
                this.logger.trace('This reading list was removed');
                this.router.navigateByUrl('/lists/reading/all');
              }
            }
          );
        }
      });
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
    this.logger.trace('Loading comics from reading list');
    this.dataSource.data = readingList.entries.map(entry => {
      return {
        selected: this.selectedIds.includes(entry.id),
        item: entry
      };
    });
  }

  ngOnDestroy(): void {
    this.logger.trace('Unsubscribing from param updates');
    this.paramsSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from reading list updates');
    this.readingListSubscription.unsubscribe();
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
        'reading-list-entries.remove-comics.confirmation-message',
        { count: this.dataSource.data.filter(entry => entry.selected).length }
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
        comicBookIds: this.readingList.entries.map(entry => entry.comicId)
      })
    );
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
}
