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
  Output,
  ViewChild
} from '@angular/core';
import { Comic } from '@app/comic-books/models/comic';
import { MatTableDataSource } from '@angular/material/table';
import { LoggerService } from '@angular-ru/cdk/logger';
import { MatSort } from '@angular/material/sort';
import { SelectableListItem } from '@app/core/models/ui/selectable-list-item';

@Component({
  selector: 'cx-comic-list-view',
  templateUrl: './comic-list-view.component.html',
  styleUrls: ['./comic-list-view.component.scss']
})
export class ComicListViewComponent implements AfterViewInit {
  @ViewChild(MatSort) sort: MatSort;

  @Output() selectedEntries = new EventEmitter<Comic[]>();

  readonly displayedColumns = [
    'selection',
    'publisher',
    'series',
    'volume',
    'issue-number',
    'cover-date',
    'added-date',
    'page-count',
    'archive-type'
  ];
  dataSource = new MatTableDataSource<SelectableListItem<Comic>>([]);
  allSelected = false;

  constructor(private logger: LoggerService) {}

  private _comics: Comic[] = [];

  get comics(): Comic[] {
    return this._comics;
  }

  @Input() set comics(comics: Comic[]) {
    this.logger.trace('Comics assigned');
    this._comics = comics;
    this.logger.trace('Loading data source');
    const oldData = this.dataSource.data;
    this.dataSource.data = comics.map(comic => {
      const oldEntry = oldData.find(entry => entry.item.id === comic.id);
      return {
        item: comic,
        selected: oldEntry?.selected || false
      };
    });
    this.updateAllSelected();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (data, sortHeaderId) => {
      switch (sortHeaderId) {
        case 'selection':
          return `${data.selected}`;
        case 'publisher':
          return data.item.publisher;
        case 'series':
          return data.item.series;
        case 'volume':
          return data.item.volume;
        case 'issue-number':
          return data.item.issueNumber;
        case 'cover-date':
          return data.item.coverDate;
        case 'added-date':
          return data.item.addedDate;
        case 'page-count':
          return data.item.pages.length;
        case 'archive-type':
          return data.item.archiveType.toUpperCase();
      }
    };
  }

  onSetAllSelectedState(checked: boolean): void {
    this.logger.trace('Setting all items selected state:', checked);
    this.dataSource.data.forEach(entry => (entry.selected = checked));
    this.updateAllSelected();
  }

  onSetOneSelectedState(
    entry: SelectableListItem<Comic>,
    checked: boolean
  ): void {
    this.logger.trace('Setting one item selected state:', entry, checked);
    entry.selected = checked;
    this.updateAllSelected();
  }

  private updateAllSelected(): void {
    this.logger.trace('Updating the all selected flag');
    this.allSelected = this.dataSource.data.every(entry => entry.selected);
    this.logger.trace('Publishing selection updates');
    this.selectedEntries.emit(
      this.dataSource.data
        .filter(entry => entry.selected)
        .map(entry => entry.item)
    );
  }
}
