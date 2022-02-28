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
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { Subscription } from 'rxjs';
import { MetadataSource } from '@app/comic-metadata/models/metadata-source';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import { loadMetadataSources } from '@app/comic-metadata/actions/metadata-source-list.actions';
import { selectMetadataSourceList } from '@app/comic-metadata/selectors/metadata-source-list.selectors';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { loadMetadataSource } from '@app/comic-metadata/actions/metadata-source.actions';

@Component({
  selector: 'cx-metadata-source-list',
  templateUrl: './metadata-source-list.component.html',
  styleUrls: ['./metadata-source-list.component.scss']
})
export class MetadataSourceListComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @ViewChild(MatSort) sort: MatSort;

  sourcesSubscription: Subscription;
  dataSource = new MatTableDataSource<MetadataSource>([]);
  readonly displayedColumns = [
    'name',
    'bean-name',
    'property-count',
    'actions'
  ];

  constructor(private logger: LoggerService, private store: Store<any>) {
    this.sourcesSubscription = this.store
      .select(selectMetadataSourceList)
      .subscribe(sources => (this.dataSource.data = sources));
  }

  ngOnDestroy(): void {
    this.logger.trace('Unsubscribing from source list updates');
    this.sourcesSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.logger.trace('Loading metadata source list');
    this.store.dispatch(loadMetadataSources());
  }

  ngAfterViewInit(): void {
    this.logger.trace('Adding table sorting');
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (data, sortHeaderId) => {
      switch (sortHeaderId) {
        case 'name':
          return data.name;
        case 'bean-name':
          return data.beanName;
      }
    };
  }

  onSelectSource(source: MetadataSource): void {
    this.logger.trace('Loading metadata source');
    this.store.dispatch(loadMetadataSource({ id: source.id }));
  }
}
