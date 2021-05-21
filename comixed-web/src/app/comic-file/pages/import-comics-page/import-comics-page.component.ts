/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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
import { ComicFile } from '@app/comic-file/models/comic-file';
import { LoggerService } from '@angular-ru/logger';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { selectUser } from '@app/user/selectors/user.selectors';
import { filter } from 'rxjs/operators';
import { getUserPreference } from '@app/user';
import { Title } from '@angular/platform-browser';
import {
  DELETE_BLOCKED_PAGES_DEFAULT,
  DELETE_BLOCKED_PAGES_PREFERENCE,
  IGNORE_METADATA_DEFAULT,
  IGNORE_METADATA_PREFERENCE,
  PAGE_SIZE_DEFAULT,
  PAGE_SIZE_PREFERENCE
} from '@app/library/library.constants';
import { MatDialog } from '@angular/material/dialog';
import { ComicFileDetailsComponent } from '@app/comic-file/components/comic-file-details/comic-file-details.component';
import { ComicFileDetailsData } from '@app/library/models/ui/comic-file-details-data';
import {
  selectComicFileListState,
  selectComicFiles,
  selectComicFileSelections
} from '@app/comic-file/selectors/comic-file-list.selectors';
import { selectComicImportState } from '@app/comic-file/selectors/comic-import.selectors';
import { selectImportComicFilesState } from '@app/comic-file/selectors/import-comic-files.selectors';
import { setBusyState } from '@app/core/actions/busy.actions';
import { sendComicFiles } from '@app/comic-file/actions/import-comic-files.actions';
import { ConfirmationService } from '@app/core/services/confirmation.service';
import { TitleService } from '@app/core/services/title.service';
import { User } from '@app/user/models/user';

@Component({
  selector: 'cx-import-comics',
  templateUrl: './import-comics-page.component.html',
  styleUrls: ['./import-comics-page.component.scss']
})
export class ImportComicsPageComponent implements OnInit, OnDestroy {
  langChangeSubscription: Subscription;
  filesSubscription: Subscription;
  files: ComicFile[];
  translateSubscription: Subscription;
  userSubscription: Subscription;
  user: User;
  comicImportStateSubscription: Subscription;
  comicFileListStateSubscription: Subscription;
  sendComicFilesStateSubscription: Subscription;
  selectedFilesSubscription: Subscription;
  selectedFiles: ComicFile[];
  busy = false;
  pageSize = PAGE_SIZE_DEFAULT;
  ignoreMetadata = false;
  deleteBlockedPages = false;
  importing = false;
  private sending = false;
  private loading = false;

  constructor(
    private logger: LoggerService,
    private title: Title,
    private store: Store<any>,
    private confirmationService: ConfirmationService,
    private translateService: TranslateService,
    private dialog: MatDialog,
    private titleService: TitleService
  ) {
    this.translateSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.userSubscription = this.store
      .select(selectUser)
      .pipe(filter(user => !!user))
      .subscribe(user => {
        this.user = user;
        this.logger.debug('User updated:', user);
        this.ignoreMetadata =
          getUserPreference(
            user.preferences,
            IGNORE_METADATA_PREFERENCE,
            IGNORE_METADATA_DEFAULT
          ) === 'true';
        this.deleteBlockedPages =
          getUserPreference(
            user.preferences,
            DELETE_BLOCKED_PAGES_PREFERENCE,
            DELETE_BLOCKED_PAGES_DEFAULT
          ) === 'true';
        this.pageSize = parseInt(
          getUserPreference(
            user.preferences,
            PAGE_SIZE_PREFERENCE,
            `${this.pageSize}`
          ),
          10
        );
      });
    this.filesSubscription = this.store
      .select(selectComicFiles)
      .subscribe(files => (this.files = files));
    this.selectedFilesSubscription = this.store
      .select(selectComicFileSelections)
      .subscribe(selectedFiles => (this.selectedFiles = selectedFiles));
    this.comicFileListStateSubscription = this.store
      .select(selectComicFileListState)
      .subscribe(state => this.setBusyState({ loading: state.loading }));
    this.sendComicFilesStateSubscription = this.store
      .select(selectImportComicFilesState)
      .subscribe(state => {
        this.setBusyState({ sending: state.sending });
      });
    this.comicImportStateSubscription = this.store
      .select(selectComicImportState)
      .subscribe(state => (this.importing = state.importing));
  }

  ngOnInit(): void {
    this.loadTranslations();
  }

  ngOnDestroy(): void {
    this.translateSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
    this.filesSubscription.unsubscribe();
    this.selectedFilesSubscription.unsubscribe();
    this.comicFileListStateSubscription.unsubscribe();
    this.sendComicFilesStateSubscription.unsubscribe();
    this.comicImportStateSubscription.unsubscribe();
  }

  onCurrentFile(file: ComicFile): void {
    this.logger.debug('Showing details for file:', file);
    if (!!file) {
      this.dialog.open(ComicFileDetailsComponent, {
        data: {
          file,
          pageSize: this.pageSize
        } as ComicFileDetailsData
      });
    }
  }

  onStartImport(): void {
    this.confirmationService.confirm({
      title: this.translateService.instant('comic-files.confirm-start-title'),
      message: this.translateService.instant(
        'comic-files.confirm-start-message',
        { count: this.selectedFiles.length }
      ),
      confirm: () => {
        this.logger.debug('Starting import');
        this.store.dispatch(
          sendComicFiles({
            files: this.selectedFiles,
            ignoreMetadata: this.ignoreMetadata,
            deleteBlockedPages: this.deleteBlockedPages
          })
        );
      }
    });
  }

  private loadTranslations(): void {
    this.logger.trace('Loading page title');
    this.titleService.setTitle(
      this.translateService.instant('comic-files.tab-title')
    );
  }

  private setBusyState(args: { sending?: boolean; loading?: boolean }): void {
    if (!!args.sending) {
      this.sending = args.sending;
    }
    if (!!args.loading) {
      this.loading = args.loading;
    }
    this.busy = this.sending || this.loading;
    this.store.dispatch(setBusyState({ enabled: this.busy }));
  }
}
