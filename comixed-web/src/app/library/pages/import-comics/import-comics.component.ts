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
import { ComicFile } from '@app/library/models/comic-file';
import { LoggerService } from '@angular-ru/logger';
import { Store } from '@ngrx/store';
import {
  selectComicFiles,
  selectComicFileSelections,
  selectComicImportState
} from '@app/library/selectors/comic-import.selectors';
import { setBusyState } from '@app/core/actions/busy.actions';
import { ConfirmationService } from '@app/core';
import { TranslateService } from '@ngx-translate/core';
import { sendComicFiles } from '@app/library/actions/comic-import.actions';
import { selectUser } from '@app/user/selectors/user.selectors';
import { filter } from 'rxjs/operators';
import { getUserPreference, User } from '@app/user';
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
import { ComicFileDetailsComponent } from '@app/library/components/comic-file-details/comic-file-details.component';
import { ComicFileDetailsData } from '@app/library/models/ui/comic-file-details-data';

@Component({
  selector: 'cx-import-comics',
  templateUrl: './import-comics.component.html',
  styleUrls: ['./import-comics.component.scss']
})
export class ImportComicsComponent implements OnInit, OnDestroy {
  filesSubscription: Subscription;
  files: ComicFile[];
  translateSubscription: Subscription;
  userSubscription: Subscription;
  user: User;
  comicImportStateSubscription: Subscription;
  selectedFilesSubscription: Subscription;
  selectedFiles: ComicFile[];
  busy = false;
  pageSize = PAGE_SIZE_DEFAULT;
  ignoreMetadata = false;
  deleteBlockedPages = false;
  importing = false;

  constructor(
    private logger: LoggerService,
    private title: Title,
    private store: Store<any>,
    private confirmationService: ConfirmationService,
    private translateService: TranslateService,
    private dialog: MatDialog
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
    this.comicImportStateSubscription = this.store
      .select(selectComicImportState)
      .subscribe(state => {
        const busy = state.sending || state.loading;
        if (this.busy !== busy) {
          this.logger.debug('Setting busy state:', busy);
          this.busy = busy;
          this.store.dispatch(setBusyState({ enabled: busy }));
        }
        this.importing = state.importing;
      });
  }

  ngOnInit(): void {
    this.loadTranslations();
  }

  ngOnDestroy(): void {
    this.translateSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
    this.filesSubscription.unsubscribe();
    this.selectedFilesSubscription.unsubscribe();
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
      title: this.translateService.instant(
        'import-comic-files.confirm-start-title'
      ),
      message: this.translateService.instant(
        'import-comic-files.confirm-start-message',
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
    this.title.setTitle(
      this.translateService.instant('import-comic-files.tab-title')
    );
  }
}
