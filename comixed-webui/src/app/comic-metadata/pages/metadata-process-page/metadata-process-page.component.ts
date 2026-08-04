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

import { AfterViewInit, Component, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import { TitleService } from '@app/core/services/title.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  MetadataUpdateProgress,
  selectMetadataUpdateProcessActive,
  selectMetadataUpdateProgress
} from '@app/comic-metadata/selectors/metadata-update-process.selectors';
import { tap } from 'rxjs/operators';
import { selectComicBookSelectionIds } from '@app/comic-books/selectors/comic-book-selection.selectors';
import { loadComicBookSelections } from '@app/comic-books/actions/comic-book-selection.actions';
import { loadComicsById } from '@app/comic-books/actions/comic-list.actions';
import {
  selectComicCoverMonths,
  selectComicCoverYears,
  selectComicList
} from '@app/comic-books/selectors/comic-list.selectors';
import { DisplayableComic } from '@app/comic-books/models/displayable-comic';
import { MetadataProcessToolbarComponent } from '../../components/metadata-process-toolbar/metadata-process-toolbar.component';
import { MetadataProcessStatusComponent } from '../../components/metadata-process-status/metadata-process-status.component';
import { ComicListViewComponent } from '../../../comic-books/components/comic-list-view/comic-list-view.component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'cx-metadata-process-page',
  templateUrl: './metadata-process-page.component.html',
  styleUrls: ['./metadata-process-page.component.scss'],
  imports: [
    MetadataProcessToolbarComponent,
    MetadataProcessStatusComponent,
    ComicListViewComponent,
    TranslateModule,
    AsyncPipe
  ]
})
export class MetadataProcessPageComponent implements AfterViewInit {
  comics$ = new BehaviorSubject<DisplayableComic[]>([]);
  coverYears$ = new BehaviorSubject<number[]>([]);
  coverMonths$ = new BehaviorSubject<number[]>([]);
  metadataUpdateActive$ = new BehaviorSubject(false);
  metadataUpdateProgress$ = new BehaviorSubject<MetadataUpdateProgress>({
    completed: 0,
    total: 0
  });
  selectedIds$ = new BehaviorSubject<number[]>([]);

  logger = inject(LoggerService);
  store = inject(Store);
  titleService = inject(TitleService);
  translateService = inject(TranslateService);

  constructor() {
    this.translateService.onLangChange
      .pipe(tap(() => this.loadTranslations()))
      .subscribe();
    this.store
      .select(selectComicBookSelectionIds)
      .pipe(
        tap(ids => {
          this.selectedIds$.next(ids);
          this.store.dispatch(loadComicsById({ ids: this.selectedIds$.value }));
        })
      )
      .subscribe();
    this.store
      .select(selectComicList)
      .pipe(tap(comics => this.comics$.next(comics)))
      .subscribe();
    this.store
      .select(selectComicCoverYears)
      .pipe(tap(coverYears => this.coverYears$.next(coverYears)))
      .subscribe();
    this.store
      .select(selectComicCoverMonths)
      .pipe(tap(coverMonths => this.coverMonths$.next(coverMonths)))
      .subscribe();
    this.store
      .select(selectMetadataUpdateProcessActive)
      .pipe(tap(active => this.metadataUpdateActive$.next(active)))
      .subscribe();
    this.store
      .select(selectMetadataUpdateProgress)
      .pipe(tap(progress => this.metadataUpdateProgress$.next(progress)))
      .subscribe();
  }

  ngAfterViewInit(): void {
    this.logger.trace('Loading the selected comic book id list');
    this.store.dispatch(loadComicBookSelections());
    this.loadTranslations();
  }

  private loadTranslations(): void {
    this.titleService.setTitle(
      this.translateService.instant('metadata-process.tab-title')
    );
  }
}
