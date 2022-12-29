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

import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { ComicBook } from '@app/comic-books/models/comic-book';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  PAGE_SIZE_DEFAULT,
  PAGE_SIZE_OPTIONS,
  PAGE_SIZE_PREFERENCE,
  QUERY_PARAM_ARCHIVE_TYPE,
  QUERY_PARAM_COVER_MONTH,
  QUERY_PARAM_COVER_YEAR,
  QUERY_PARAM_PAGE_INDEX,
  QUERY_PARAM_SORT_BY,
  SHOW_COMIC_COVERS_PREFERENCE,
  SORT_FIELD_PREFERENCE
} from '@app/library/library.constants';
import { Subscription } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { saveUserPreference } from '@app/user/actions/user.actions';
import { ArchiveType } from '@app/comic-books/models/archive-type.enum';
import { SelectionOption } from '@app/core/models/ui/selection-option';
import { startLibraryConsolidation } from '@app/library/actions/consolidate-library.actions';
import { rescanComics } from '@app/library/actions/rescan-comics.actions';
import { updateMetadata } from '@app/library/actions/update-metadata.actions';
import { purgeLibrary } from '@app/library/actions/purge-library.actions';
import { ConfirmationService } from '@tragically-slick/confirmation';
import { ListItem } from '@app/core/models/ui/list-item';
import { selectUser } from '@app/user/selectors/user.selectors';
import { getUserPreference } from '@app/user';
import { UrlParameterService } from '@app/core/services/url-parameter.service';

@Component({
  selector: 'cx-library-toolbar',
  templateUrl: './library-toolbar.component.html',
  styleUrls: ['./library-toolbar.component.scss']
})
export class LibraryToolbarComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @Input() selectedIds: number[] = [];
  @Input() isAdmin = false;
  @Input() pageSize = PAGE_SIZE_DEFAULT;
  @Input() pageIndex = 0;
  @Input() showUpdateMetadata = false;
  @Input() showConsolidate = false;
  @Input() showPurge = false;
  @Input() archiveType: ArchiveType;
  @Input() showActions = true;
  @Input() sortField: string;
  @Input() coverMonth: number = null;
  @Input() coverYear: number = null;
  @Input() showCoverFilters = true;

  @Output() selectAllComics = new EventEmitter<boolean>();

  userSubscription: Subscription;
  showCovers = true;

  readonly pageSizeOptions = PAGE_SIZE_OPTIONS;
  readonly archiveTypeOptions: SelectionOption<ArchiveType>[] = [
    { label: 'archive-type.label.all', value: null },
    { label: 'archive-type.label.cbz', value: ArchiveType.CBZ },
    { label: 'archive-type.label.cbr', value: ArchiveType.CBR },
    { label: 'archive-type.label.cb7', value: ArchiveType.CB7 }
  ];
  readonly sortFieldOptions: SelectionOption<string>[] = [
    { label: 'sorting.label.by-added-date', value: 'added-date' },
    { label: 'sorting.label.by-cover-date', value: 'cover-date' },
    { label: 'sorting.label.by-issue-number', value: 'issue-number' }
  ];

  langChangSubscription: Subscription;
  coverYears: ListItem<number>[] = [];
  coverMonths: ListItem<number>[] = [];

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private confirmationService: ConfirmationService,
    private translateService: TranslateService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private urlParameterService: UrlParameterService
  ) {
    this.langChangSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.userSubscription = this.store.select(selectUser).subscribe(user => {
      this.showCovers =
        getUserPreference(
          user.preferences,
          SHOW_COMIC_COVERS_PREFERENCE,
          `${true}`
        ) === `${true}`;
    });
  }

  private _comicBooks: ComicBook[] = [];

  get comicBooks(): ComicBook[] {
    return this._comicBooks;
  }

  @Input() set comicBooks(comics: ComicBook[]) {
    this._comicBooks = comics;
    this.coverYears = [
      { label: 'filtering.label.all-years', value: null } as ListItem<number>
    ].concat(
      comics
        .filter(comic => !!comic.coverDate)
        .map(comic => new Date(comic.coverDate).getFullYear())
        .filter((year, index, self) => index === self.indexOf(year))
        .sort((left, right) => left - right)
        .map(year => {
          return { value: year, label: `${year}` } as ListItem<number>;
        })
    );
  }

  get selectedComicBooks(): ComicBook[] {
    return this.comicBooks.filter(comic => this.selectedIds.includes(comic.id));
  }

  ngOnInit(): void {
    this.coverMonths = [
      { label: 'filtering.label.all-months', value: null }
    ].concat(
      Array.from(Array(12).keys()).map(month => {
        return {
          value: month,
          label: `filtering.label.month-${month}`
        } as ListItem<number>;
      })
    );
  }

  ngAfterViewInit(): void {
    this.loadTranslations();
  }

  ngOnDestroy(): void {
    this.langChangSubscription.unsubscribe();
  }

  onSelectAll(): void {
    this.selectAllComics.emit(true);
  }

  onDeselectAll(): void {
    this.selectAllComics.emit(false);
  }

  onScrapeComics(): void {
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'scraping.start-scraping.confirmation-title',
        { count: this.selectedIds.length }
      ),
      message: this.translateService.instant(
        'scraping.start-scraping.confirmation-message',
        { count: this.selectedIds.length }
      ),
      confirm: () => {
        this.logger.debug('Start scraping comics');
        this.router.navigate(['/library', 'scrape']);
      }
    });
  }

  onLibraryDisplayChange(
    pageSize: number,
    pageIndex: number,
    previousPageIndex: number
  ): void {
    this.logger.trace('Page size changed');
    this.store.dispatch(
      saveUserPreference({
        name: PAGE_SIZE_PREFERENCE,
        value: `${pageSize}`
      })
    );
    if (pageIndex !== previousPageIndex) {
      this.logger.debug('Page index changed:', pageIndex);
      this.urlParameterService.updateQueryParam([
        {
          name: QUERY_PARAM_PAGE_INDEX,
          value: `${pageIndex}`
        }
      ]);
    }
  }

  onArchiveTypeChanged(archiveType: ArchiveType): void {
    this.logger.trace('Archive type selected:', archiveType);
    this.urlParameterService.updateQueryParam([
      {
        name: QUERY_PARAM_ARCHIVE_TYPE,
        value: archiveType
      }
    ]);
  }

  onConsolidateLibrary(): void {
    this.logger.trace('Confirming with the user to consolidate the library');
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'library.consolidate.confirmation-title'
      ),
      message: this.translateService.instant(
        'library.consolidate.confirmation-message'
      ),
      confirm: () => {
        this.logger.trace('Firing action: consolidate library');
        this.store.dispatch(startLibraryConsolidation());
      }
    });
  }

  onRescanComics(): void {
    this.logger.trace('Confirming with the user to rescan the selected comics');
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'library.rescan-comics.confirmation-title'
      ),
      message: this.translateService.instant(
        'library.rescan-comics.confirmation-message',
        { count: this.selectedIds.length }
      ),
      confirm: () => {
        this.logger.trace('Firing action to rescan comics');
        this.store.dispatch(
          rescanComics({ comicBooks: this.selectedComicBooks })
        );
      }
    });
  }

  onUpdateMetadata(): void {
    this.logger.trace('Confirming with the user to update metadata');
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'library.update-metadata.confirmation-title'
      ),
      message: this.translateService.instant(
        'library.update-metadata.confirmation-message',
        { count: this.selectedIds.length }
      ),
      confirm: () => {
        this.logger.trace('Firing action: update metadata');
        this.store.dispatch(
          updateMetadata({
            ids: this.selectedIds
          })
        );
      }
    });
  }

  onSortBy(sortField: string): void {
    this.logger.trace('Changing sort field:', sortField);
    this.urlParameterService.updateQueryParam([
      {
        name: QUERY_PARAM_SORT_BY,
        value: sortField
      }
    ]);
    this.store.dispatch(
      saveUserPreference({ name: SORT_FIELD_PREFERENCE, value: sortField })
    );
  }

  onPurgeLibrary(): void {
    this.logger.trace('Confirming purging the library');
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'library.purge-library.confirmation-title'
      ),
      message: this.translateService.instant(
        'library.purge-library.confirmation-message'
      ),
      confirm: () => {
        this.logger.trace('Firing action: purge library');
        this.store.dispatch(purgeLibrary({ ids: this.selectedIds }));
      }
    });
  }

  onCoverYearChange(year: number): void {
    this.logger.debug('Setting cover year filter:', year);
    this.urlParameterService.updateQueryParam([
      {
        name: QUERY_PARAM_COVER_YEAR,
        value: !!year ? `${year}` : null
      }
    ]);
  }

  onCoverMonthChange(month: number): void {
    this.logger.debug('Setting cover month filter:', month);
    this.urlParameterService.updateQueryParam([
      {
        name: QUERY_PARAM_COVER_MONTH,
        value: !!month ? `${month}` : null
      }
    ]);
  }

  onToggleShowCoverMode(): void {
    this.logger.trace('Toggling show cover mode');
    this.store.dispatch(
      saveUserPreference({
        name: SHOW_COMIC_COVERS_PREFERENCE,
        value: `${!this.showCovers}`
      })
    );
  }

  private loadTranslations(): void {
    this.paginator._intl.itemsPerPageLabel = this.translateService.instant(
      'library.label.pagination-items-per-page'
    );
  }
}
