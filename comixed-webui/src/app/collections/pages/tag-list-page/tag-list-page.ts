/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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

import { Component, inject, signal } from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { CollectionService } from '@app/collections/services/collection-service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { TitleService } from '@app/layout/services/title-service';
import { ActivatedRoute, Router } from '@angular/router';
import { comicTagTypeFromString } from '@app/library/models/comic-tag-type';
import { TagStore } from '@app/collections/stores/tag-store';
import { Card } from '@openng/optimus-ui/card';
import { TableModule } from '@openng/optimus-ui/table';
import { Breadcrumb } from '@openng/optimus-ui/breadcrumb';
import { MenuItem } from '@openng/optimus-ui/api';

@Component({
  imports: [TranslatePipe, Card, TableModule, Breadcrumb],
  selector: 'app-tag-list-page',
  styleUrl: './tag-list-page.scss',
  templateUrl: './tag-list-page.html'
})
export class TagListPage {
  readonly logger = inject(LoggerService);
  readonly collectionsService = inject(CollectionService);
  readonly tagStore = inject(TagStore);
  readonly translateService = inject(TranslateService);
  readonly titleService = inject(TitleService);
  readonly activatedRoute = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly trail = signal<MenuItem[]>([]);

  home: MenuItem = { icon: 'pi pi-home', routerLink: ['/'] };

  constructor() {
    this.logger.trace('Subscribing to router parameter updates');
    this.activatedRoute.paramMap.subscribe({
      next: params => {
        if (!params.has('tagType')) {
          this.logger.error('Missing tag type');
          this.router.navigateByUrl('/');
        }
        const typeParameter = params.get('tagType');
        this.logger.trace('Extracting tag type');
        const providedType = comicTagTypeFromString(typeParameter || '')!;
        if (providedType) {
          this.tagStore.setTagType(providedType);
          this.collectionsService.loadCollectionEntryList({
            tagType: providedType,
            searchText: '',
            index: 0,
            size: 10,
            sortBy: '',
            sortDirection: ''
          });
        } else {
          this.logger.error('Invalid tag type:', typeParameter);
          this.router.navigateByUrl('/');
        }
      }
    });
    this.translateService.onLangChange.subscribe({
      next: () => {
        this.doLoadTranslations();
      }
    });
    this.doLoadTranslations();
  }

  private doLoadTranslations() {
    this.titleService.setTitle(
      this.translateService.instant('tag-list-page.page-title', {
        tagType: this.tagStore.tagType()
      })
    );
    this.trail.set([
      {
        label: this.translateService.instant('tag-list-page.page-title', {
          tagType: this.tagStore.tagType()
        })
      }
    ]);
  }
}
