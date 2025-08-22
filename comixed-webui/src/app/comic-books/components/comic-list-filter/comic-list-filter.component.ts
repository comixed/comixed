/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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

import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LoggerService } from '@angular-ru/cdk/logger';
import { ListItem } from '@app/core/models/ui/list-item';
import { SelectionOption } from '@app/core/models/ui/selection-option';
import { ArchiveType } from '@app/comic-books/models/archive-type.enum';
import { ComicType } from '@app/comic-books/models/comic-type';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import {
  QUERY_PARAM_ARCHIVE_TYPE,
  QUERY_PARAM_COMIC_TYPE,
  QUERY_PARAM_COVER_MONTH,
  QUERY_PARAM_COVER_YEAR,
  QUERY_PARAM_FILTER_TEXT,
  QUERY_PARAM_PAGE_COUNT
} from '@app/core';

@Component({
  selector: 'cx-comic-list-filter',
  templateUrl: './comic-list-filter.component.html',
  styleUrls: ['./comic-list-filter.component.scss'],
  standalone: false
})
export class ComicListFilterComponent {
  @Output() closeFilter = new EventEmitter<void>();

  filterForm: FormGroup;
  displayableCoverYears: ListItem<string>[] = [];
  displayableCoverMonths: ListItem<string>[] = [];
  queryParamSubscription: Subscription;

  readonly archiveTypeOptions: SelectionOption<ArchiveType>[] = [
    { label: 'archive-type.label.all', value: null },
    { label: 'archive-type.label.cbz', value: ArchiveType.CBZ },
    { label: 'archive-type.label.cbr', value: ArchiveType.CBR },
    { label: 'archive-type.label.cb7', value: ArchiveType.CB7 }
  ];
  readonly comicTypeOptions: SelectionOption<ComicType>[] = [
    { label: 'comic-type.label.all', value: null },
    { label: 'comic-type.label.issue', value: ComicType.ISSUE },
    {
      label: 'comic-type.label.trade-paperback',
      value: ComicType.TRADEPAPERBACK
    },
    { label: 'comic-type.label.manga', value: ComicType.MANGA }
  ];
  readonly pageCountOptions: ListItem<string>[] = Array.from(
    { length: 250 },
    (_, index) => index
  ).map(entry => {
    return {
      label: `${entry}`,
      value: entry > 0 ? `${entry}` : null
    } as ListItem<string>;
  });

  logger = inject(LoggerService);
  formBuilder = inject(FormBuilder);
  activatedRoute = inject(ActivatedRoute);
  queryParameterService = inject(QueryParameterService);

  constructor() {
    this.logger.trace('Creating the comic list filter form group');
    this.filterForm = this.formBuilder.group({
      filterText: [''],
      coverYear: [''],
      coverMonth: [''],
      archiveType: [''],
      comicType: [''],
      pageCount: ['']
    });
    this.logger.trace('Subscribing to query param updates');
    this.queryParamSubscription = this.activatedRoute.queryParams.subscribe(
      params => {
        this.filterForm.controls['filterText'].setValue(
          params[QUERY_PARAM_FILTER_TEXT] || ''
        );
        this.filterForm.controls['coverYear'].setValue(
          params[QUERY_PARAM_COVER_YEAR]
        );
        this.filterForm.controls['coverMonth'].setValue(
          params[QUERY_PARAM_COVER_MONTH]
        );
        this.filterForm.controls['archiveType'].setValue(
          params[QUERY_PARAM_ARCHIVE_TYPE]
        );
        this.filterForm.controls['comicType'].setValue(
          params[QUERY_PARAM_COMIC_TYPE]
        );
        this.filterForm.controls['pageCount'].setValue(
          params[QUERY_PARAM_PAGE_COUNT]
        );
        this.filterForm.markAsPristine();
      }
    );
  }

  @Input() set coverYears(coverYears: number[]) {
    this.displayableCoverYears = [
      {
        label: 'filtering.label.all-years',
        value: null
      } as ListItem<string>
    ].concat(
      coverYears
        .filter(year => !!year)
        .sort((l, r) => l - r)
        .map(year => {
          return { value: `${year}`, label: `${year}` } as ListItem<string>;
        })
    );
  }

  @Input() set coverMonths(coverMonths: number[]) {
    this.displayableCoverMonths = [
      { label: 'filtering.label.all-months', value: null }
    ].concat(
      coverMonths
        .filter(month => !!month)
        .sort((l, r) => l - r)
        .map(month => {
          return {
            value: `${month}`,
            label: `filtering.label.month-${month}`
          } as ListItem<string>;
        })
    );
  }

  onClose(): void {
    this.logger.debug('Canceling filter updates');
    this.closeFilter.emit();
  }
}
