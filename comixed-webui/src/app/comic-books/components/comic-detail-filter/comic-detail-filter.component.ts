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

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LoggerService } from '@angular-ru/cdk/logger';
import { ListItem } from '@app/core/models/ui/list-item';
import { ComicDetail } from '@app/comic-books/models/comic-detail';
import { SelectionOption } from '@app/core/models/ui/selection-option';
import { ArchiveType } from '@app/comic-books/models/archive-type.enum';
import { ComicType } from '@app/comic-books/models/comic-type';

@Component({
  selector: 'cx-comic-detail-filter',
  templateUrl: './comic-detail-filter.component.html',
  styleUrls: ['./comic-detail-filter.component.scss']
})
export class ComicDetailFilterComponent {
  @Input() comicDetails: ComicDetail[] = [];

  @Output() closeFilter = new EventEmitter<void>();

  filterForm: FormGroup;
  displayableCoverYears: ListItem<number>[] = [];
  displayableCoverMonths: ListItem<number>[] = [];
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

  constructor(
    private logger: LoggerService,
    private formBuilder: FormBuilder,
    public queryParameterService: QueryParameterService
  ) {
    this.filterForm = this.formBuilder.group({
      filterText: [''],
      coverYear: [''],
      coverMonth: [''],
      archiveType: [''],
      comicType: ['']
    });
  }

  @Input() set coverYears(coverYears: number[]) {
    this.displayableCoverYears = [
      {
        label: 'filtering.label.all-years',
        value: null
      } as ListItem<number>
    ].concat(
      coverYears.map(year => {
        return { value: year, label: `${year}` } as ListItem<number>;
      })
    );
  }

  @Input() set coverMonths(coverMonths: number[]) {
    this.displayableCoverMonths = [
      { label: 'filtering.label.all-months', value: null }
    ].concat(
      coverMonths.map(month => {
        return {
          value: month,
          label: `filtering.label.month-${month - 1}`
        } as ListItem<number>;
      })
    );
  }

  onClose(): void {
    this.logger.debug('Canceling filter updates');
    this.closeFilter.emit();
  }
}
