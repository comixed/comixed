/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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
import { VolumeMetadata } from '@app/comic-metadata/models/volume-metadata';
import { MatTableDataSource } from '@angular/material/table';
import {
  EXACT_MATCH,
  MATCHABILITY,
  NEAR_MATCH,
  NO_MATCH
} from '@app/comic-books/components/comic-metadata/comic-metadata.component';
import { SortableListItem } from '@app/core/models/ui/sortable-list-item';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { LoggerService } from '@angular-ru/cdk/logger';
import { PAGE_SIZE_DEFAULT, PAGE_SIZE_OPTIONS } from '@app/core';

@Component({
  selector: 'cx-volume-metadata-table',
  templateUrl: './volume-metadata-table.component.html',
  styleUrls: ['./volume-metadata-table.component.scss']
})
export class VolumeMetadataTableComponent implements AfterViewInit {
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  @Input() publisher = null;
  @Input() series = '';
  @Input() volume = '';
  @Input() issueNumber = null;

  dataSource = new MatTableDataSource<SortableListItem<VolumeMetadata>>([]);
  displayedColumns = [
    MATCHABILITY,
    'thumbnail',
    'publisher',
    'name',
    'start-year',
    'issue-count',
    'action'
  ];
  readonly pageOptions = PAGE_SIZE_OPTIONS;
  @Input() pageSize = PAGE_SIZE_DEFAULT;
  selectedVolume: VolumeMetadata;
  @Output() volumeSelected = new EventEmitter<VolumeMetadata>();
  @Output() volumeChosen = new EventEmitter<VolumeMetadata>();

  constructor(private logger: LoggerService) {}

  @Input() set volumes(volumes: VolumeMetadata[]) {
    this.dataSource.data = volumes.map(volume => {
      const sortOrder =
        (!this.publisher || this.publisher == volume.publisher) &&
        volume.name === this.series &&
        volume.startYear === this.volume
          ? EXACT_MATCH
          : (!this.publisher || this.publisher === volume.publisher) &&
            volume.name === this.series
          ? NEAR_MATCH
          : NO_MATCH;
      return {
        item: volume,
        sortOrder
      } as SortableListItem<VolumeMetadata>;
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (element, property) => {
      switch (property) {
        case MATCHABILITY:
          return element.sortOrder;
        case 'start-year':
          return element.item.startYear;
        case 'issue-count':
          return element.item.issueCount;
        default:
          return element.item[property];
      }
    };
    this.dataSource.paginator = this.paginator;
    this.dataSource.filterPredicate = (data, filter) => {
      return (
        this.isMatch(data.item.publisher, filter) ||
        this.isMatch(data.item.name, filter)
      );
    };
  }

  onVolumeSelected(volume: VolumeMetadata): void {
    this.logger.debug('Selected volume:', volume);
    this.selectedVolume = volume;
    this.volumeSelected.emit(volume);
  }

  onVolumeChosen(volume: VolumeMetadata): void {
    this.logger.debug('Volume chosen:', volume);
    this.volumeChosen.emit(volume);
  }

  private isMatch(text, filter: string) {
    return (
      (text || '').toLocaleLowerCase().indexOf(filter.toLocaleLowerCase()) !==
      -1
    );
  }
}
