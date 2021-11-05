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
import { Comic } from '@app/comic-books/models/comic';
import { LoggerService } from '@angular-ru/logger';
import { Store } from '@ngrx/store';
import {
  deselectComics,
  selectComics
} from '@app/library/actions/library.actions';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService } from '@app/core/services/confirmation.service';
import { Router } from '@angular/router';
import {
  PAGE_SIZE_DEFAULT,
  PAGE_SIZE_OPTIONS,
  PAGE_SIZE_PREFERENCE,
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

@Component({
  selector: 'cx-library-toolbar',
  templateUrl: './library-toolbar.component.html',
  styleUrls: ['./library-toolbar.component.scss']
})
export class LibraryToolbarComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @ViewChild(MatPaginator) paginator: MatPaginator;

  @Input() comics: Comic[] = [];
  @Input() selected: Comic[] = [];
  @Input() isAdmin = false;
  @Input() pageSize = PAGE_SIZE_DEFAULT;
  @Input() showUpdateMetadata = false;
  @Input() showConsolidate = false;
  @Input() showPurge = false;
  @Input() archiveType: ArchiveType;
  @Input() showActions = true;
  @Input() sortField: string;

  @Output() archiveTypeChanged = new EventEmitter<ArchiveType>();

  readonly pageSizeOptions = PAGE_SIZE_OPTIONS;
  readonly archiveTypeOptions: SelectionOption<ArchiveType>[] = [
    { label: 'archive-type.label.all', value: null },
    { label: 'archive-type.label.cbz', value: ArchiveType.CBZ },
    { label: 'archive-type.label.cbr', value: ArchiveType.CBR },
    { label: 'archive-type.label.cb7', value: ArchiveType.CB7 }
  ];
  readonly sortFieldOptions: SelectionOption<string>[] = [
    { label: 'sorting.label.by-added-date', value: 'added-date' },
    { label: 'sorting.label.by-cover-date', value: 'cover-date' }
  ];

  langChangSubscription: Subscription;

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private confirmationService: ConfirmationService,
    private translateService: TranslateService,
    private router: Router
  ) {
    this.langChangSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
  }

  ngAfterViewInit(): void {
    this.loadTranslations();
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.langChangSubscription.unsubscribe();
  }

  onSelectAll(): void {
    this.logger.debug('Selecting all comics');
    this.store.dispatch(selectComics({ comics: this.comics }));
  }

  onDeselectAll(): void {
    this.logger.debug('Deselecting all comics');
    this.store.dispatch(deselectComics({ comics: this.selected }));
  }

  onScrapeComics(): void {
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'scraping.start-scraping.confirmation-title',
        { count: this.selected.length }
      ),
      message: this.translateService.instant(
        'scraping.start-scraping.confirmation-message',
        { count: this.selected.length }
      ),
      confirm: () => {
        this.logger.debug('Start scraping comics');
        this.router.navigate(['/library', 'scrape']);
      }
    });
  }

  onPageSizeChange(pageSize: number): void {
    this.logger.trace('Page size changed');
    this.store.dispatch(
      saveUserPreference({
        name: PAGE_SIZE_PREFERENCE,
        value: `${pageSize}`
      })
    );
  }

  onArchiveTypeChanged(archiveType: ArchiveType): void {
    this.logger.trace('Archive type selected:', archiveType);
    this.archiveTypeChanged.emit(archiveType);
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
    const comics = this.selected;
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'library.rescan-comics.confirmation-title'
      ),
      message: this.translateService.instant(
        'library.rescan-comics.confirmation-message',
        { count: comics.length }
      ),
      confirm: () => {
        this.logger.trace('Firing action to rescan comics');
        this.store.dispatch(rescanComics({ comics }));
      }
    });
  }

  onUpdateMetadata(): void {
    this.logger.trace('Confirming with the user to update metadata');
    const comics = this.selected;
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'library.update-metadata.confirmation-title'
      ),
      message: this.translateService.instant(
        'library.update-metadata.confirmation-message',
        { count: comics.length }
      ),
      confirm: () => {
        this.logger.trace('Firing action: update metadata');
        this.store.dispatch(updateMetadata({ comics }));
      }
    });
  }

  onSortBy(sortField: string): void {
    this.logger.trace('Changing sort field');
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
        this.store.dispatch(
          purgeLibrary({ ids: this.selected.map(comic => comic.id) })
        );
      }
    });
  }

  private loadTranslations(): void {
    this.paginator._intl.itemsPerPageLabel = this.translateService.instant(
      'library.label.pagination-items-per-page'
    );
  }
}
