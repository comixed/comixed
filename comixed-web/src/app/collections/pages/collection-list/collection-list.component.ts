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
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { LoggerService } from '@angular-ru/logger';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import {
  CollectionType,
  collectionTypeFromString
} from '@app/collections/models/comic-collection.enum';
import { selectComicListCollection } from '@app/comic-book/selectors/comic-list.selectors';
import { MatTableDataSource } from '@angular/material/table';
import { CollectionListEntry } from '@app/collections/models/collection-list-entry';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'cx-collection-list',
  templateUrl: './collection-list.component.html',
  styleUrls: ['./collection-list.component.scss']
})
export class CollectionListComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @ViewChild(MatSort) matSort: MatSort;

  typeSubscription: Subscription;
  paramSubscription: Subscription;
  collectionType: CollectionType;
  routableTypeName: string;
  collectionSubscription: Subscription;
  dataSource = new MatTableDataSource<CollectionListEntry>([]);
  readonly displayedColumns = ['name', 'comic-count'];

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.paramSubscription = this.activatedRoute.params.subscribe(params => {
      this.routableTypeName = params.collectionType;
      this.collectionType = collectionTypeFromString(this.routableTypeName);
      if (!this.collectionType) {
        this.logger.error('Invalid collection type:', params.collectionType);
        this.router.navigateByUrl('/library');
      } else {
        this.collectionSubscription = this.store
          .select(selectComicListCollection, {
            collectionType: this.collectionType
          })
          .subscribe(
            entries => (this.entries = entries.filter(entry => !!entry.name))
          );
      }
    });
  }

  set entries(entries: CollectionListEntry[]) {
    this.logger.debug('Setting collection entries:', entries);
    console.log('Setting collection entries:', entries);
    this.dataSource.data = entries;
  }

  ngOnDestroy(): void {
    this.paramSubscription.unsubscribe();
    if (!!this.collectionSubscription) {
      this.collectionSubscription.unsubscribe();
    }
  }

  ngOnInit(): void {}

  onShowCollection(entry: CollectionListEntry): void {
    this.logger.debug('Collection entry selected:', entry);
    this.router.navigate([
      '/library',
      'collections',
      this.routableTypeName,
      entry.name
    ]);
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.matSort;
    this.dataSource.sortingDataAccessor = (data, sortHeaderId) => {
      switch (sortHeaderId) {
        case 'name':
          return data.name;
        case 'comic-count':
          return data.comicCount;
      }
    };
  }
}
