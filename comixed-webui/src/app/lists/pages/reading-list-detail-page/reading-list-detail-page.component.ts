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

import { Component, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { WebSocketService } from '@app/messaging';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  createReadingList,
  loadReadingList,
  readingListLoaded,
  saveReadingList
} from '@app/lists/actions/reading-list-detail.actions';
import {
  selectReadingList,
  selectReadingListBusy,
  selectReadingListNotFound
} from '@app/lists/selectors/reading-list-detail.selectors';
import { ReadingList } from '@app/lists/models/reading-list';
import {
  FormGroup,
  ReactiveFormsModule,
  UntypedFormBuilder,
  Validators
} from '@angular/forms';
import { filter, tap } from 'rxjs/operators';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { removeSelectedComicBooksFromReadingList } from '@app/lists/actions/reading-list-entries.actions';
import { selectMessagingStarted } from '@app/messaging/selectors/messaging.selectors';
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
import { MatFabButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { ComicListViewComponent } from '../../../comic-books/components/comic-list-view/comic-list-view.component';
import { setBusyState } from '@app/core/actions/busy.actions';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'cx-user-reading-list-page',
  templateUrl: './reading-list-detail-page.component.html',
  styleUrls: ['./reading-list-detail-page.component.scss'],
  imports: [
    MatFabButton,
    RouterLink,
    MatTooltip,
    MatIcon,
    ReactiveFormsModule,
    MatFormField,
    MatInput,
    ComicListViewComponent,
    TranslateModule,
    AsyncPipe
  ]
})
export class ReadingListDetailPageComponent {
  readingListForm: FormGroup;
  readingListId$ = new BehaviorSubject(-1);
  selectedIds$ = new BehaviorSubject<number[]>([]);
  comicBooksRead$ = new BehaviorSubject<number[]>([]);
  comics$ = new BehaviorSubject<DisplayableComic[]>([]);
  email$ = new BehaviorSubject<string | null>(null);

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
    this.activatedRoute.params
      .pipe(
        tap(params => {
          if (!!params.id) {
            this.readingListId$.next(+params.id);
            this.logger.trace(
              'Firing action to load reading list by id:',
              this.readingListId$.value
            );
            this.store.dispatch(
              loadReadingList({ id: this.readingListId$.value })
            );
          } else {
            this.readingListId$.next(-1);
            this.logger.trace('Resetting comic list');
            this.store.dispatch(resetComicList());
            this.logger.trace('Firing action to create a reading list');
            this.store.dispatch(createReadingList());
          }
        })
      )
      .subscribe();
    this.activatedRoute.queryParams
      .pipe(tap(() => this.loadReadingListEntries()))
      .subscribe();
    this.readingListForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(128)]],
      summary: ['']
    });
    this.store
      .select(selectReadingListBusy)
      .pipe(tap(enabled => this.store.dispatch(setBusyState({ enabled }))))
      .subscribe();
    this.store
      .select(selectReadingListNotFound)
      .pipe(
        tap(notFound => {
          if (notFound) {
            this.logger.trace('Reading list not found');
            this.router.navigateByUrl('/lists/reading/all');
          }
        })
      )
      .subscribe();
    this.store
      .select(selectReadingList)
      .pipe(
        filter(list => !!list),
        tap(readingList => {
          if (this.readingListId$.value === -1 && !!readingList.readingListId) {
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
        })
      )
      .subscribe();
    this.store
      .select(selectComicList)
      .pipe(tap(comics => this.comics$.next(comics)))
      .subscribe();
    this.store
      .select(selectComicBookSelectionIds)
      .pipe(
        tap(selections => {
          this.selectedIds$.next(selections);
        })
      )
      .subscribe();
    this.store
      .select(selectReadComicBooksList)
      .pipe(tap(comicBooksRead => this.comicBooksRead$.next(comicBooksRead)))
      .subscribe();
    this.store
      .select(selectMessagingStarted)
      .pipe(
        filter(started => started === true),
        tap(started => {
          this.doSubscribeToListUpdates();
        })
      )
      .subscribe();
    this.store
      .select(selectUser)
      .pipe(
        tap(user => {
          this.email$.next(user?.email);
          this.doSubscribeToListUpdates();
        })
      )
      .subscribe();
    this.translateService.onLangChange
      .pipe(tap(() => this.loadTranslations()))
      .subscribe();
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
        readingListId: this.readingListId$.value,
        pageSize: this.queryParameterService.pageSize$.value,
        pageIndex: this.queryParameterService.pageIndex$.value,
        sortBy: this.queryParameterService.sortBy$.value,
        sortDirection: this.queryParameterService.sortDirection$.value
      })
    );
  }

  private doSubscribeToListUpdates() {
    if (!!this.email$.value && this.readingListId$.value) {
      this.webSocketService.subscribe(
        interpolate(READING_LIST_UPDATES_TOPIC, {
          id: this.readingListId$.value,
          email: this.email$.value
        }),
        list => {
          this.logger.trace('Reading list updated received');
          this.store.dispatch(readingListLoaded({ list }));
          this.loadReadingListEntries();
        }
      );

      this.webSocketService.subscribe(
        interpolate(READING_LIST_REMOVAL_TOPIC, { email: this.email$.value }),
        list => {
          this.logger.trace('Reading list removal received');
          this.store.dispatch(readingListRemoved({ list }));
          if (list.readingListId === this.readingListId$.value) {
            this.logger.trace('This reading list was removed');
            this.router.navigateByUrl('/lists/reading/all');
          }
        }
      );
    }
  }
}
