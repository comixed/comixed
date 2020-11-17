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
import { ComicFile } from '@app/comic-import/models/comic-file';
import { LoggerService } from '@angular-ru/logger';
import { Store } from '@ngrx/store';
import {
  selectComicFiles,
  selectComicFileSelections,
  selectComicImportState
} from '@app/comic-import/selectors/comic-import.selectors';
import { setBusyState } from '@app/core/actions/busy.actions';
import { ConfirmationService } from '@app/core';
import { TranslateService } from '@ngx-translate/core';
import { sendComicFiles } from '@app/comic-import/actions/comic-import.actions';
import { selectUser } from '@app/user/selectors/user.selectors';
import { filter } from 'rxjs/operators';
import { getUserPreference } from '@app/user';
import {
  USER_PREFERENCE_DELETE_BLOCKED_PAGES,
  USER_PREFERENCE_IGNORE_METADATA
} from '@app/user/user.constants';
import { Title } from '@angular/platform-browser';

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
  comicImportStateSubscription: Subscription;
  selectedFilesSubscription: Subscription;
  selectedFiles: ComicFile[];
  currentFile: ComicFile;
  currentFileSelected: boolean;
  busy = false;
  ignoreMetadata = false;
  deleteBlockedPages = false;
  importing = false;

  constructor(
    private logger: LoggerService,
    private title: Title,
    private store: Store<any>,
    private confirmationService: ConfirmationService,
    private translateService: TranslateService
  ) {
    this.translateSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.userSubscription = this.store
      .select(selectUser)
      .pipe(filter(user => !!user))
      .subscribe(user => {
        this.ignoreMetadata =
          getUserPreference(
            user.preferences,
            USER_PREFERENCE_IGNORE_METADATA,
            'false'
          ) === 'true';
        this.deleteBlockedPages =
          getUserPreference(
            user.preferences,
            USER_PREFERENCE_DELETE_BLOCKED_PAGES,
            'false'
          ) === 'true';
      });
    this.filesSubscription = this.store
      .select(selectComicFiles)
      .subscribe(files => (this.files = files));
    this.selectedFilesSubscription = this.store
      .select(selectComicFileSelections)
      .subscribe(selectedFiles => {
        this.selectedFiles = selectedFiles;
        this.currentFileSelected =
          !!this.currentFile && this.selectedFiles.includes(this.currentFile);
      });
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
    this.logger.debug('Current file changed:', file);
    this.currentFile = file;
    this.currentFileSelected =
      !!this.currentFile && this.selectedFiles.includes(this.currentFile);
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
