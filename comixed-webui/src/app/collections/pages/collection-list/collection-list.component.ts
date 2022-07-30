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
import { LoggerService } from '@angular-ru/cdk/logger';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import {
  CollectionType,
  collectionTypeFromString
} from '@app/collections/models/comic-collection.enum';
import { selectComicBookListCollection } from '@app/comic-books/selectors/comic-book-list.selectors';
import { MatTableDataSource } from '@angular/material/table';
import { CollectionListEntry } from '@app/collections/models/collection-list-entry';
import { MatSort } from '@angular/material/sort';
import { TranslateService } from '@ngx-translate/core';
import { TitleService } from '@app/core/services/title.service';

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
  langChangeSubscription: Subscription;

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private translateService: TranslateService,
    private titleService: TitleService
  ) {
    this.paramSubscription = this.activatedRoute.params.subscribe(params => {
      this.routableTypeName = params.collectionType;
      this.collectionType = collectionTypeFromString(this.routableTypeName);
      this.loadTranslations();
      if (!this.collectionType) {
        this.logger.error('Invalid collection type:', params.collectionType);
        this.router.navigateByUrl('/library');
      } else {
        this.collectionSubscription = this.store
          .select(selectComicBookListCollection, {
            collectionType: this.collectionType
          })
          .subscribe(
            entries => (this.entries = entries.filter(entry => !!entry.name))
          );
      }
    });
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
  }

  set entries(entries: CollectionListEntry[]) {
    this.logger.debug('Setting collection entries:', entries);
    this.dataSource.data = entries;
  }

  ngOnDestroy(): void {
    this.paramSubscription.unsubscribe();
    if (!!this.collectionSubscription) {
      this.collectionSubscription.unsubscribe();
    }
    this.langChangeSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.loadTranslations();
  }

  onShowCollection(entry: CollectionListEntry): void {
    this.logger.debug('Collection entry selected:', entry);
    if (this.collectionType === CollectionType.SERIES) {
      const seriesName = entry.name.substring(0, entry.name.length - 6);
      const volume = entry.name.substring(entry.name.length - 4);
      this.router.navigate([
        '/library',
        'collections',
        'series',
        seriesName,
        'volumes',
        volume
      ]);
    } else {
      this.router.navigate([
        '/library',
        'collections',
        this.routableTypeName,
        entry.name
      ]);
    }
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

  private loadTranslations(): void {
    this.titleService.setTitle(
      this.translateService.instant('collection-list.tab-title', {
        collection: this.collectionType
      })
    );
  }
}
