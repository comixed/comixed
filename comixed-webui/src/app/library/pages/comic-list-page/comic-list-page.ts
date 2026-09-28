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

import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Card } from '@openng/optimus-ui/card';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { LibraryService } from '@app/library/services/library-service';
import { ComicListStore } from '@app/library/stores/comic-list-store';
import { TableLazyLoadEvent, TableModule } from '@openng/optimus-ui/table';
import { DatePipe } from '@angular/common';
import { ComicCoverUrlPipe } from '@app/library/pipes/comic-cover-url-pipe';
import {
  FaIconComponent,
  IconDefinition
} from '@fortawesome/angular-fontawesome';
import { ComicState } from '@app/library/models/comic-state';
import {
  faBoltLightning,
  faCircleCheck,
  faFile,
  faPlus,
  faQuestion,
  faRotate,
  faTrash
} from '@fortawesome/free-solid-svg-icons';
import { Breadcrumb } from '@openng/optimus-ui/breadcrumb';
import { MenuItem } from '@openng/optimus-ui/api';
import { TitleService } from '@app/layout/services/title-service';

@Component({
  imports: [
    Card,
    TranslatePipe,
    TableModule,
    DatePipe,
    ComicCoverUrlPipe,
    FaIconComponent,
    Breadcrumb
  ],
  selector: 'app-comic-list-page',
  styleUrl: './comic-list-page.scss',
  templateUrl: './comic-list-page.html'
})
export class ComicListPage {
  readonly logger = inject(LoggerService);
  readonly translateService = inject(TranslateService);
  readonly titleService = inject(TitleService);
  readonly activatedRoute = inject(ActivatedRoute);
  readonly libraryService = inject(LibraryService);
  readonly comicListStore = inject(ComicListStore);

  home: MenuItem = { icon: 'pi pi-home', routerLink: ['/'] };
  trail: MenuItem[] = [];

  allComics = true;
  readComics = false;
  unscrapedComics = false;
  duplicateComics = false;
  deletedComics = false;

  constructor() {
    this.activatedRoute.data.subscribe({
      next: data => {
        this.logger.debug('Activated route data updated:', data);
        this.readComics = data['readOnly'] === true;
        this.unscrapedComics = data['unscraped'] === true;
        this.duplicateComics = data['duplicates'] === true;
        this.deletedComics = data['deleted'] === true;
        this.allComics =
          !this.readComics &&
          !this.unscrapedComics &&
          !this.duplicateComics &&
          !this.deletedComics;
      }
    });
    this.translateService.onLangChange.subscribe({
      next: () => this.doLoadTranslations()
    });
    this.doLoadTranslations();
  }

  getPageType(): string {
    if (this.readComics) {
      return 'READ';
    }
    if (this.unscrapedComics) {
      return 'UNSCRAPED';
    }
    if (this.duplicateComics) {
      return 'DUPLICATE';
    }
    if (this.deletedComics) {
      return 'DELETED';
    }
    return '';
  }

  onLoad(event: TableLazyLoadEvent): void {
    this.doLoadComics({
      pageIndex: event.first! / event.rows!,
      pageSize: event.rows!
    });
  }

  getIconForComicState(comicState: ComicState): IconDefinition {
    switch (comicState) {
      case ComicState.ADDED:
        return faPlus;
      case ComicState.DISCOVERED:
        return faFile;
      case ComicState.UNPROCESSED:
        return faBoltLightning;
      case ComicState.STABLE:
        return faCircleCheck;
      case ComicState.CHANGED:
        return faRotate;
      case ComicState.DELETED:
        return faTrash;
      default:
        return faQuestion;
    }
  }

  private doLoadComics(args: { pageIndex: number; pageSize: number }) {
    this.logger.trace('Loading comics:', args);
    this.libraryService.loadComicsByFilter({
      pageSize: args.pageSize,
      pageIndex: args.pageIndex,
      coverYear: null,
      coverMonth: null,
      archiveType: null,
      comicType: null,
      comicState: null,
      selected: false,
      missing: false,
      unscrapedState: this.unscrapedComics,
      searchText: null,
      publisher: null,
      series: null,
      volume: null,
      pageCount: null,
      sortBy: '',
      sortDirection: ''
    });
  }

  private doLoadTranslations() {
    const pageTitle = this.translateService.instant(
      'comic-list-page.page-title',
      { pageType: this.getPageType() }
    );
    this.titleService.setTitle(pageTitle);
    this.trail = [{ label: pageTitle }];
  }
}
