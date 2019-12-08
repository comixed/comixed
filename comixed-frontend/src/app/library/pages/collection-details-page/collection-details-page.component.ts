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
import { SelectionAdaptor } from 'app/library';
import { CollectionAdaptor } from 'app/library/adaptors/collection.adaptor';
import { CollectionType } from 'app/library/models/collection-type.enum';
import { LoadPageEvent } from 'app/library/models/ui/load-page-event';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';

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
  comicSubscription: Subscription;
  comics: Comic[] = [];
  comicCountSubscription: Subscription;
  comicCount = 0;
  selectedComicsSubscription: Subscription;
  selectedComics: Comic[] = [];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    private breadcrumbAdaptor: BreadcrumbAdaptor,
    private collectionAdaptor: CollectionAdaptor,
    private translateService: TranslateService,
    private messageService: MessageService,
    private selectionAdaptor: SelectionAdaptor
  ) {}

  ngOnInit() {
    this.routeParamsSubscription = this.activatedRoute.params.subscribe(
      params => {
        const typeName = params['collectionType'].toString().toUpperCase();
        this.collectionType = CollectionType[typeName] as CollectionType;
        if (!!this.collectionType) {
          this.collectionName = params.collectionName;
        } else {
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
    this.comicSubscription = this.collectionAdaptor.comics$.subscribe(
      comics => (this.comics = comics)
    );
    this.comicCountSubscription = this.collectionAdaptor.comicCount$.subscribe(
      comicCount => (this.comicCount = comicCount)
    );
    this.selectedComicsSubscription = this.selectionAdaptor.comicSelection$.subscribe(
      selected => (this.selectedComics = selected)
    );
  }

  ngOnDestroy() {
    this.routeParamsSubscription.unsubscribe();
    this.comicSubscription.unsubscribe();
    this.comicCountSubscription.unsubscribe();
    this.selectedComicsSubscription.unsubscribe();
  }

  private loadPage(event: LoadPageEvent): void {
    this.collectionAdaptor.getPageForEntry(
      this.collectionType,
      this.collectionName,
      event.page,
      event.size,
      event.sortField,
      event.ascending
    );
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
