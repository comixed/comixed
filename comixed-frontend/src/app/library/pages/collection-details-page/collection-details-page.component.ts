/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BreadcrumbAdaptor } from 'app/adaptors/breadcrumb.adaptor';
import { Comic } from 'app/comics';
import { LibraryAdaptor, SelectionAdaptor } from 'app/library';
import { CollectionType } from 'app/library/models/collection-type.enum';
import { MessageService } from 'primeng/api';
import { Observable, Subscription } from 'rxjs';
import { ComicCollectionEntry } from 'app/library/models/comic-collection-entry';
import { LoggerService } from '@angular-ru/logger';

@Component({
  selector: 'app-collection-details-page',
  templateUrl: './collection-details-page.component.html',
  styleUrls: ['./collection-details-page.component.scss']
})
export class CollectionDetailsPageComponent implements OnInit, OnDestroy {
  routeParamsSubscription: Subscription;
  langChangeSubscription: Subscription;
  collectionType: CollectionType;
  collectionName = '';
  collectionSubscription: Subscription;
  comics: Comic[] = [];
  selectedComicsSubscription: Subscription;
  selectedComics: Comic[] = [];

  constructor(
    private logger: LoggerService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    private breadcrumbAdaptor: BreadcrumbAdaptor,
    private libraryAdaptor: LibraryAdaptor,
    private translateService: TranslateService,
    private messageService: MessageService,
    private selectionAdaptor: SelectionAdaptor
  ) {}

  ngOnInit() {
    this.routeParamsSubscription = this.activatedRoute.params.subscribe(
      params => {
        this.logger.debug('params updated:', params);
        const typeName = params['collectionType'].toString().toUpperCase();
        this.collectionType = CollectionType[typeName] as CollectionType;
        if (!!this.collectionType) {
          this.collectionName = params.collectionName;
          this.logger.debug(
            `targeting collection: type=${this.collectionType} name=${this.collectionName}`
          );
          let target: Observable<ComicCollectionEntry[]> = null;

          switch (this.collectionType) {
            case CollectionType.PUBLISHERS:
              target = this.libraryAdaptor.publishers$;
              break;
            case CollectionType.SERIES:
              target = this.libraryAdaptor.series$;
              break;
            case CollectionType.CHARACTERS:
              target = this.libraryAdaptor.characters$;
              break;
            case CollectionType.TEAMS:
              target = this.libraryAdaptor.teams$;
              break;
            case CollectionType.LOCATIONS:
              target = this.libraryAdaptor.locations$;
              break;
            case CollectionType.STORIES:
              target = this.libraryAdaptor.stories$;
              break;
          }

          this.collectionSubscription = target.subscribe(collection => {
            this.logger.info('finding the collection entry:', collection);
            const entry = collection.find(c => c.name === this.collectionName);
            this.comics = !!entry ? entry.comics : [];
            this.logger.debug('collection comics:', this.comics);
          });
        } else {
          this.logger.info('invalid collection type:', typeName);
          this.messageService.add({
            severity: 'error',
            detail: this.translateService.instant(
              'collections.error.invalid-collection-type',
              { name: typeName }
            )
          });
          this.router.navigateByUrl('/home');
        }
      }
    );
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.loadTranslations();
    this.selectedComicsSubscription = this.selectionAdaptor.comicSelection$.subscribe(
      selected => (this.selectedComics = selected)
    );
  }

  ngOnDestroy() {
    this.routeParamsSubscription.unsubscribe();
    this.collectionSubscription.unsubscribe();
    this.selectedComicsSubscription.unsubscribe();
  }

  private loadTranslations() {
    this.titleService.setTitle(
      this.translateService.instant('collection-details-page.title', {
        collectionType: this.collectionType.toString().toUpperCase(),
        name: this.collectionName
      })
    );
    this.breadcrumbAdaptor.loadEntries([
      {
        label: this.translateService.instant('breadcrumb.collections.root')
      },
      {
        label: this.translateService.instant(
          `breadcrumb.collections.${this.collectionType}`
        ),
        routerLink: [`/collections/${this.collectionType}`]
      },
      {
        label: this.collectionName
      }
    ]);
  }
}
