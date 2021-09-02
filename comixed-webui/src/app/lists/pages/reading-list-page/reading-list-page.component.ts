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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { WebSocketService } from '@app/messaging';
import { LoggerService } from '@angular-ru/logger';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import {
  createReadingList,
  loadReadingList,
  saveReadingList
} from '@app/lists/actions/reading-list-detail.actions';
import {
  selectReadingList,
  selectReadingListState
} from '@app/lists/selectors/reading-list-detail.selectors';
import { setBusyState } from '@app/core/actions/busy.actions';
import { ReadingList } from '@app/lists/models/reading-list';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { filter } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService } from '@app/core/services/confirmation.service';
import { Comic } from '@app/comic-book/models/comic';
import { removeComicsFromReadingList } from '@app/lists/actions/reading-list-entries.actions';

@Component({
  selector: 'cx-user-reading-list-page',
  templateUrl: './reading-list-page.component.html',
  styleUrls: ['./reading-list-page.component.scss']
})
export class ReadingListPageComponent implements OnInit, OnDestroy {
  paramsSubscription: Subscription;
  readingListStateSubscription: Subscription;
  readingListSubscription: Subscription;
  readingListForm: FormGroup;
  readingListId = -1;
  selectedEntries: Comic[] = [];

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private webSocketService: WebSocketService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private confirmationService: ConfirmationService,
    private translateService: TranslateService
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
      summary: ['', []]
    });
    this.readingListStateSubscription = this.store
      .select(selectReadingListState)
      .subscribe(state => {
        if (state.notFound) {
          this.logger.trace('Reading list not found');
          this.router.navigateByUrl('/lists/reading');
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
        }
      });
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
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.logger.trace('Unsubscribing from param updates');
    this.paramsSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from reading list updates');
    this.readingListSubscription.unsubscribe();
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
        { count: this.selectedEntries.length }
      ),
      confirm: () => {
        this.logger.trace('Firing action: remove comics from reading list');
        this.store.dispatch(
          removeComicsFromReadingList({
            list: this.readingList,
            comics: this.selectedEntries
          })
        );
      }
    });
  }

  onSelectionChanged(selected: Comic[]): void {
    this.logger.debug('Selected reading list comics changed:', selected);
    this.selectedEntries = selected;
  }

  private encodeForm(): ReadingList {
    return {
      ...this.readingList,
      name: this.readingListForm.controls.name.value,
      summary: this.readingListForm.controls.summary.value
    };
  }
}
