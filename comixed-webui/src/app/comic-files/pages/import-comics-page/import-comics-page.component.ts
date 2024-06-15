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

import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { Subscription } from 'rxjs';
import { ComicFile } from '@app/comic-files/models/comic-file';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { selectUser } from '@app/user/selectors/user.selectors';
import { filter } from 'rxjs/operators';
import { getUserPreference } from '@app/user';
import { Title } from '@angular/platform-browser';
import {
  selectComicFileListState,
  selectComicFiles,
  selectComicFileSelections
} from '@app/comic-files/selectors/comic-file-list.selectors';
import { selectImportComicFilesState } from '@app/comic-files/selectors/import-comic-files.selectors';
import { setBusyState } from '@app/core/actions/busy.actions';
import { sendComicFiles } from '@app/comic-files/actions/import-comic-files.actions';
import { TitleService } from '@app/core/services/title.service';
import { User } from '@app/user/models/user';
import { ConfirmationService } from '@tragically-slick/confirmation';
import { PAGE_SIZE_DEFAULT } from '@app/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatTableDataSource } from '@angular/material/table';
import { SelectableListItem } from '@app/core/models/ui/selectable-list-item';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import {
  clearComicFileSelections,
  resetComicFileList,
  setComicFilesSelectedState
} from '@app/comic-files/actions/comic-file-list.actions';
import { Router } from '@angular/router';
import { saveUserPreference } from '@app/user/actions/user.actions';
import {
  PREFERENCE_SKIP_BLOCKING_PAGES,
  PREFERENCE_SKIP_METADATA
} from '@app/comic-files/comic-file.constants';
import { selectFeatureEnabledState } from '@app/admin/selectors/feature-enabled.selectors';
import { hasFeature, isFeatureEnabled } from '@app/admin';
import { BLOCKED_PAGES_ENABLED } from '@app/admin/admin.constants';
import { getFeatureEnabled } from '@app/admin/actions/feature-enabled.actions';

@Component({
  selector: 'cx-import-comics',
  templateUrl: './import-comics-page.component.html',
  styleUrls: ['./import-comics-page.component.scss']
})
export class ImportComicsPageComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatMenuTrigger) contextMenu: MatMenuTrigger;

  readonly displayedColumns = [
    'selection',
    'thumbnail',
    'filename',
    'base-filename',
    'size'
  ];
  dataSource = new MatTableDataSource<SelectableListItem<ComicFile>>([]);
  langChangeSubscription: Subscription;
  filesSubscription$: Subscription;
  files: ComicFile[];
  translateSubscription$: Subscription;
  userSubscription$: Subscription;
  user: User;
  comicFileListStateSubscription$: Subscription;
  sendComicFilesStateSubscription$: Subscription;
  selectedFilesSubscription$: Subscription;
  selectedFiles: ComicFile[] = [];
  pageSize = PAGE_SIZE_DEFAULT;
  showFinderForm = false;
  allSelected = false;
  anySelected = false;
  skipMetadata = false;
  skipBlockingPages = false;
  showCoverPopup = false;
  comicFile: ComicFile = null;
  featureEnabledSubscription$: Subscription;
  blockedPagesEnabled = false;

  constructor(
    private logger: LoggerService,
    private title: Title,
    private store: Store<any>,
    private confirmationService: ConfirmationService,
    private translateService: TranslateService,
    private titleService: TitleService,
    private router: Router,
    public queryParameterService: QueryParameterService
  ) {
    this.translateSubscription$ = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.userSubscription$ = this.store
      .select(selectUser)
      .pipe(filter(user => !!user))
      .subscribe(user => {
        this.user = user;
        this.logger.debug('User updated:', user);
        this.skipMetadata =
          getUserPreference(
            user.preferences,
            PREFERENCE_SKIP_METADATA,
            `${false}`
          ) === `${true}`;
        this.skipBlockingPages =
          getUserPreference(
            user.preferences,
            PREFERENCE_SKIP_BLOCKING_PAGES,
            `${false}`
          ) === `${true}`;
      });
    this.filesSubscription$ = this.store
      .select(selectComicFiles)
      .subscribe(files => {
        this.files = files;
        this.updateDataSource();
        this.updateSelectionState();
        this.showFinderForm = false;
      });
    this.selectedFilesSubscription$ = this.store
      .select(selectComicFileSelections)
      .subscribe(selectedFiles => {
        this.selectedFiles = selectedFiles;
        this.updateDataSource();
        this.updateSelectionState();
      });
    this.comicFileListStateSubscription$ = this.store
      .select(selectComicFileListState)
      .subscribe(state =>
        this.store.dispatch(setBusyState({ enabled: state.loading }))
      );
    this.sendComicFilesStateSubscription$ = this.store
      .select(selectImportComicFilesState)
      .subscribe(state =>
        this.store.dispatch(setBusyState({ enabled: state.sending }))
      );
    this.featureEnabledSubscription$ = this.store
      .select(selectFeatureEnabledState)
      .subscribe(state => {
        if (!state.busy && !hasFeature(state.features, BLOCKED_PAGES_ENABLED)) {
          this.logger.debug('Loading feature state:', BLOCKED_PAGES_ENABLED);
          this.store.dispatch(
            getFeatureEnabled({ name: BLOCKED_PAGES_ENABLED })
          );
        } else {
          this.blockedPagesEnabled = isFeatureEnabled(
            state.features,
            BLOCKED_PAGES_ENABLED
          );
        }
      });
  }

  ngAfterViewInit(): void {
    this.logger.debug('Setting pagination');
    this.dataSource.paginator = this.paginator;
    this.logger.debug('Setting sorting');
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (data, sortHeaderId) => {
      switch (sortHeaderId) {
        case 'selected':
          return `${data.selected}`;
        case 'base-filename':
          return data.item.baseFilename;
        case 'filename':
          return data.item.filename;
        case 'size':
          return data.item.size;
      }
      return data.item.id;
    };
    this.logger.debug('Resetting the list of comic files');
    this.store.dispatch(resetComicFileList());
  }

  ngOnInit(): void {
    this.loadTranslations();
  }

  ngOnDestroy(): void {
    this.logger.trace('Unsubscribing from language change updates');
    this.translateSubscription$.unsubscribe();
    this.logger.trace('Unsubscribing from user state updates');
    this.userSubscription$.unsubscribe();
    this.logger.trace('Unsubscribing from comic file updates');
    this.filesSubscription$.unsubscribe();
    this.logger.trace('Unsubscribing from selected comic file updates');
    this.selectedFilesSubscription$.unsubscribe();
    this.logger.trace('Unsubscribing from comic file list state updates');
    this.comicFileListStateSubscription$.unsubscribe();
    this.logger.trace('Unsubscribing from send comic file state updates');
    this.sendComicFilesStateSubscription$.unsubscribe();
    this.logger.trace('Unsubscribing from feature enabled updates');
    this.featureEnabledSubscription$.unsubscribe();
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
            skipMetadata: this.skipMetadata,
            skipBlockingPages: this.skipBlockingPages
          })
        );
      }
    });
  }

  onToggleAllSelected(selected: boolean): void {
    if (selected) {
      this.onSelectAll();
    } else {
      this.onDeselectAll();
    }
  }

  onSelectAll(): void {
    this.logger.debug('Firing action: select all comic files');
    this.store.dispatch(
      setComicFilesSelectedState({
        files: this.files,
        selected: true
      })
    );
  }

  onDeselectAll(): void {
    this.logger.debug('Deselecting all comic files');
    this.store.dispatch(clearComicFileSelections());
  }

  onSelectEntry(file: ComicFile, selected: boolean): void {
    this.logger.debug('Selecting comic file:', file);
    this.store.dispatch(
      setComicFilesSelectedState({ selected, files: [file] })
    );
  }

  onSkipMetadata(skipMetadata: boolean): void {
    this.logger.debug('Setting skip metadata:', skipMetadata);
    this.store.dispatch(
      saveUserPreference({
        name: PREFERENCE_SKIP_METADATA,
        value: `${skipMetadata}`
      })
    );
  }

  onShowPopup(showPopup: boolean, comicFile: ComicFile): void {
    if (showPopup) {
      this.logger.debug('Showing comic file cover:', comicFile);
      this.comicFile = comicFile;
      this.showCoverPopup = true;
    } else {
      this.logger.debug('Hiding comic file cover');
      this.comicFile = null;
      this.showCoverPopup = false;
    }
  }

  onSkipBlockingPages(skipBlockingPages: boolean): void {
    this.logger.debug('Setting skip skipBlockingPages:', skipBlockingPages);
    this.store.dispatch(
      saveUserPreference({
        name: PREFERENCE_SKIP_BLOCKING_PAGES,
        value: `${skipBlockingPages}`
      })
    );
  }

  private loadTranslations(): void {
    this.logger.trace('Loading page title');
    this.titleService.setTitle(
      this.translateService.instant('comic-files.tab-title')
    );
  }

  private updateSelectionState(): void {
    this.allSelected = this.dataSource.data.every(entry => entry.selected);
    this.anySelected = this.dataSource.data.some(entry => entry.selected);
  }

  private updateDataSource() {
    this.dataSource.data = this.files.map(file => {
      return {
        item: file,
        selected: this.selectedFiles.map(entry => entry.id).includes(file.id)
      };
    });
  }
}
