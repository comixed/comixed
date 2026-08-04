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
  OnInit,
  ViewChild
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ComicFile } from '@app/comic-files/models/comic-file';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { selectUser } from '@app/user/selectors/user.selectors';
import { filter, tap } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';
import {
  selectComicFileListState,
  selectComicFiles,
  selectComicFilesCurrentPath,
  selectComicGroups
} from '@app/comic-files/selectors/comic-file-list.selectors';
import { selectImportComicFilesState } from '@app/comic-files/selectors/import-comic-files.selectors';
import { setBusyState } from '@app/core/actions/busy.actions';
import { importComicFiles } from '@app/comic-files/actions/import-comic-files.actions';
import { TitleService } from '@app/core/services/title.service';
import { User } from '@app/user/models/user';
import { ConfirmationService } from '@tragically-slick/confirmation';
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
  toggleComicFileSelections,
  updateCurrentPath
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
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { AsyncPipe, DecimalPipe } from '@angular/common';
import { ComicFileCoverUrlPipe } from '../../pipes/comic-file-cover-url.pipe';
import { MatOption, MatSelect } from '@angular/material/select';
import { ComicFileGroup } from '@app/comic-files/models/comic-file-group';
import { SelectionOption } from '@app/core/models/ui/selection-option';
import { MatInput } from '@angular/material/input';

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
    ComicFileCoverUrlPipe,
    MatSelect,
    MatOption,
    MatFormField,
    MatInput
  ]
})
export class ImportComicsPageComponent implements OnInit, AfterViewInit {
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
  files$ = new BehaviorSubject<ComicFile[]>([]);
  groups$ = new BehaviorSubject<ComicFileGroup[]>([]);
  user$ = new BehaviorSubject<User | null>(null);
  selectedFileCount$ = new BehaviorSubject(0);
  showFinderForm$ = new BehaviorSubject(false);
  allSelected$ = new BehaviorSubject(false);
  anySelected$ = new BehaviorSubject(false);
  showCoverPopup$ = new BehaviorSubject(false);
  comicFile$ = new BehaviorSubject<ComicFile | null>(null);
  blockedPagesEnabled$ = new BehaviorSubject(false);
  currentPath$ = new BehaviorSubject<string | null>(null);
  pathOptions$ = new BehaviorSubject<SelectionOption<string>[]>([]);

  logger = inject(LoggerService);
  title = inject(Title);
  store = inject(Store);
  confirmationService = inject(ConfirmationService);
  translateService = inject(TranslateService);
  titleService = inject(TitleService);
  router = inject(Router);
  queryParameterService = inject(QueryParameterService);

  constructor() {
    this.translateService.onLangChange
      .pipe(tap(() => this.loadTranslations()))
      .subscribe();
    this.store
      .select(selectUser)
      .pipe(filter(user => !!user))
      .pipe(
        tap(user => {
          this.user$.next(user);
          this.logger.debug('User updated:', user);
        })
      )
      .subscribe();
    this.store
      .select(selectComicFiles)
      .pipe(
        tap(files => {
          this.files$.next(files);
          this.updateDisplayedFilesAndSelections();
          this.showFinderForm$.next(false);
          this.selectedFileCount$.next(
            this.files$.value.filter(file => file.selected).length
          );
        })
      )
      .subscribe();
    this.store
      .select(selectComicGroups)
      .pipe(
        tap(groups => {
          this.groups$.next(groups);
          this.updateDisplayedFilesAndSelections();
        })
      )
      .subscribe();
    this.store
      .select(selectComicFileListState)
      .pipe(
        tap(state => {
          this.store.dispatch(setBusyState({ enabled: state.busy }));
          this.pathOptions$.next(
            [{ label: 'comic-files.text.all-directories', value: null }].concat(
              state.groups.map(group => {
                return {
                  label: group.directory,
                  value: group.directory
                } as SelectionOption<string>;
              })
            )
          );
        })
      )
      .subscribe();
    this.store
      .select(selectImportComicFilesState)
      .pipe(
        tap(state =>
          this.store.dispatch(setBusyState({ enabled: state.sending }))
        )
      )
      .subscribe();
    this.store
      .select(selectFeatureEnabledState)
      .pipe(
        tap(state => {
          if (
            !state.busy &&
            !hasFeature(state.features, BLOCKED_PAGES_ENABLED)
          ) {
            this.logger.debug('Loading feature state:', BLOCKED_PAGES_ENABLED);
            this.store.dispatch(
              getFeatureEnabled({ name: BLOCKED_PAGES_ENABLED })
            );
          } else {
            this.blockedPagesEnabled$.next(
              isFeatureEnabled(state.features, BLOCKED_PAGES_ENABLED)
            );
          }
        })
      )
      .subscribe();
    this.store
      .select(selectComicFilesCurrentPath)
      .pipe(
        tap(path => {
          this.currentPath$.next(path);
          this.updateDisplayedFilesAndSelections();
        })
      )
      .subscribe();
  }

  ngAfterViewInit(): void {
    this.logger.debug('Setting pagination');
    this.dataSource.paginator = this.paginator;
    this.logger.debug('Setting sorting');
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (data, sortHeaderId) => {
      switch (sortHeaderId) {
        case 'selection':
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

  onStartImport(): void {
    this.confirmationService.confirm({
      title: this.translateService.instant('comic-files.confirm-start-title'),
      message: this.translateService.instant(
        'comic-files.confirm-start-message',
        { count: this.selectedFileCount$.value }
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
        filename: this.currentPath$.value,
        selected: selected,
        single: false
      })
    );
  }

  onSelectEntry(file: ComicFile, selected: boolean): void {
    this.logger.debug('Selecting comic file:', file);
    this.store.dispatch(
      toggleComicFileSelections({
        filename: file.filename,
        selected,
        single: true
      })
    );
  }

  onShowPopup(showPopup: boolean, comicFile: ComicFile): void {
    if (showPopup) {
      this.logger.debug('Showing comic file cover:', comicFile);
      this.comicFile$.next(comicFile);
      this.showCoverPopup$.next(true);
    } else {
      this.logger.debug('Hiding comic file cover');
      this.comicFile$.next(null);
      this.showCoverPopup$.next(false);
    }
  }

  onChangeCurrentPath(path: string | null): void {
    this.logger.debug('Changing current path:', path);
    this.store.dispatch(updateCurrentPath({ path }));
  }

  protected closeFinderForm() {
    this.showFinderForm$.next(false);
  }

  protected openFinderForm() {
    this.showFinderForm$.next(true);
  }

  private loadTranslations(): void {
    this.logger.trace('Loading page title');
    this.titleService.setTitle(
      this.translateService.instant('comic-files.tab-title')
    );
  }

  private updateDisplayedFilesAndSelections(): void {
    if (!!this.currentPath$.value) {
      this.logger.info(
        'Showing comic files from group:',
        this.currentPath$.value
      );
      this.dataSource.data =
        this.groups$.value.find(
          group => group.directory === this.currentPath$.value
        )?.files || [];
    } else {
      this.logger.info('Showing all comic files');
      this.dataSource.data = this.files$.value;
    }
    this.allSelected$.next(this.dataSource.data.every(entry => entry.selected));
    this.anySelected$.next(this.dataSource.data.some(entry => entry.selected));
  }
}
