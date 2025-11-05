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
  inject,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { Subscription } from 'rxjs';
import { ComicFile } from '@app/comic-files/models/comic-file';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { selectUser } from '@app/user/selectors/user.selectors';
import { filter } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';
import {
  selectComicFileListState,
  selectComicFiles
} from '@app/comic-files/selectors/comic-file-list.selectors';
import { selectImportComicFilesState } from '@app/comic-files/selectors/import-comic-files.selectors';
import { setBusyState } from '@app/core/actions/busy.actions';
import { importComicFiles } from '@app/comic-files/actions/import-comic-files.actions';
import { TitleService } from '@app/core/services/title.service';
import { User } from '@app/user/models/user';
import { ConfirmationService } from '@tragically-slick/confirmation';
import { PAGE_SIZE_DEFAULT } from '@app/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import {
  MatMenu,
  MatMenuContent,
  MatMenuItem,
  MatMenuTrigger
} from '@angular/material/menu';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatNoDataRow,
  MatRow,
  MatRowDef,
  MatTable,
  MatTableDataSource
} from '@angular/material/table';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import {
  loadComicFilesFromSession,
  toggleComicFileSelections
} from '@app/comic-files/actions/comic-file-list.actions';
import { Router } from '@angular/router';
import { selectFeatureEnabledState } from '@app/admin/selectors/feature-enabled.selectors';
import { hasFeature, isFeatureEnabled } from '@app/admin';
import { BLOCKED_PAGES_ENABLED } from '@app/admin/admin.constants';
import { getFeatureEnabled } from '@app/admin/actions/feature-enabled.actions';
import { MatFabButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import {
  MatCard,
  MatCardContent,
  MatCardSubtitle,
  MatCardTitle
} from '@angular/material/card';
import { ComicFileLoaderComponent } from '../../components/comic-file-loader/comic-file-loader.component';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatLabel } from '@angular/material/form-field';
import { AsyncPipe, DecimalPipe } from '@angular/common';
import { ComicFileCoverUrlPipe } from '../../pipes/comic-file-cover-url.pipe';

@Component({
  selector: 'cx-import-comics',
  templateUrl: './import-comics-page.component.html',
  styleUrls: ['./import-comics-page.component.scss'],
  imports: [
    MatFabButton,
    MatTooltip,
    MatIcon,
    MatCardTitle,
    MatCardSubtitle,
    MatCard,
    MatCardContent,
    ComicFileLoaderComponent,
    MatPaginator,
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatSortHeader,
    MatCheckbox,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatNoDataRow,
    MatMenu,
    MatMenuContent,
    MatMenuItem,
    MatLabel,
    AsyncPipe,
    DecimalPipe,
    TranslateModule,
    ComicFileCoverUrlPipe
  ]
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
  dataSource = new MatTableDataSource<ComicFile>([]);
  langChangeSubscription: Subscription;
  filesSubscription$: Subscription;
  files: ComicFile[];
  translateSubscription$: Subscription;
  userSubscription$: Subscription;
  user: User;
  comicFileListStateSubscription$: Subscription;
  sendComicFilesStateSubscription$: Subscription;
  selectedFileCount = 0;
  pageSize = PAGE_SIZE_DEFAULT;
  showFinderForm = false;
  allSelected = false;
  anySelected = false;
  showCoverPopup = false;
  comicFile: ComicFile = null;
  featureEnabledSubscription$: Subscription;
  blockedPagesEnabled = false;

  logger = inject(LoggerService);
  title = inject(Title);
  store = inject(Store);
  confirmationService = inject(ConfirmationService);
  translateService = inject(TranslateService);
  titleService = inject(TitleService);
  router = inject(Router);
  queryParameterService = inject(QueryParameterService);

  constructor() {
    this.translateSubscription$ = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.userSubscription$ = this.store
      .select(selectUser)
      .pipe(filter(user => !!user))
      .subscribe(user => {
        this.user = user;
        this.logger.debug('User updated:', user);
      });
    this.filesSubscription$ = this.store
      .select(selectComicFiles)
      .subscribe(files => {
        this.files = files;
        this.dataSource.data = files;
        this.updateSelectionState();
        this.showFinderForm = false;
        this.selectedFileCount = this.files.filter(
          file => file.selected
        ).length;
      });
    this.comicFileListStateSubscription$ = this.store
      .select(selectComicFileListState)
      .subscribe(state =>
        this.store.dispatch(setBusyState({ enabled: state.busy }))
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
          return data.baseFilename;
        case 'filename':
          return data.filename;
        case 'size':
          return data.size;
      }
      return data.id;
    };
  }

  ngOnInit(): void {
    this.logger.debug('Loading comic files from session');
    this.store.dispatch(loadComicFilesFromSession());
    this.loadTranslations();
  }

  ngOnDestroy(): void {
    this.logger.trace('Unsubscribing from language change updates');
    this.translateSubscription$.unsubscribe();
    this.logger.trace('Unsubscribing from user state updates');
    this.userSubscription$.unsubscribe();
    this.logger.trace('Unsubscribing from comic file updates');
    this.filesSubscription$.unsubscribe();
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
        { count: this.selectedFileCount }
      ),
      confirm: () => {
        this.logger.debug('Starting import');
        this.store.dispatch(importComicFiles());
      }
    });
  }

  onSelectAll(selected: boolean): void {
    this.store.dispatch(
      toggleComicFileSelections({
        filename: '',
        selected: selected
      })
    );
  }

  onSelectEntry(file: ComicFile, selected: boolean): void {
    this.logger.debug('Selecting comic file:', file);
    this.store.dispatch(
      toggleComicFileSelections({ filename: file.filename, selected })
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
}
