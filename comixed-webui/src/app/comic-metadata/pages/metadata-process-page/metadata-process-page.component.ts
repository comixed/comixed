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

import { AfterViewInit, Component, inject, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import { TitleService } from '@app/core/services/title.service';
import { TranslateService } from '@ngx-translate/core';
import { selectMetadataUpdateProcessState } from '@app/comic-metadata/selectors/metadata-update-process.selectors';
import { MetadataUpdateProcessState } from '@app/comic-metadata/reducers/metadata-update-process.reducer';
import { SHOW_COMIC_COVERS_PREFERENCE } from '@app/library/library.constants';
import { selectUser } from '@app/user/selectors/user.selectors';
import { getUserPreference } from '@app/user';
import { filter } from 'rxjs/operators';
import { PAGE_SIZE_DEFAULT } from '@app/core';
import { selectComicBookSelectionIds } from '@app/comic-books/selectors/comic-book-selection.selectors';
import { loadComicBookSelections } from '@app/comic-books/actions/comic-book-selection.actions';
import { PREFERENCE_PAGE_SIZE } from '@app/comic-files/comic-file.constants';
import { loadComicsById } from '@app/comic-books/actions/comic-list.actions';
import {
  selectComicCoverMonths,
  selectComicCoverYears,
  selectComicList
} from '@app/comic-books/selectors/comic-list.selectors';
import { DisplayableComic } from '@app/comic-books/models/displayable-comic';

@Component({
  selector: 'cx-metadata-process-page',
  templateUrl: './metadata-process-page.component.html',
  styleUrls: ['./metadata-process-page.component.scss'],
  standalone: false
})
export class MetadataProcessPageComponent implements OnDestroy, AfterViewInit {
  comics: DisplayableComic[] = [];

  langChangeSubscription: Subscription;
  selectIdSubscription: Subscription;
  comicDetailListSubscription: Subscription;
  comicDetailCoverYearSubscription: Subscription;
  coverYears: number[] = [];
  comicDetailCoverMonthsSubscription: Subscription;
  coverMonths: number[] = [];
  processStateSubscription: Subscription;
  processState: MetadataUpdateProcessState;
  selectedIds: number[] = [];
  userSubscription: Subscription;
  pageSize = PAGE_SIZE_DEFAULT;
  showCovers = false;

  logger = inject(LoggerService);
  store = inject(Store);
  titleService = inject(TitleService);
  translateService = inject(TranslateService);

  constructor() {
    this.logger.trace('Subscribing to language change events');
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.logger.trace('Subscribing to selection updates');
    this.selectIdSubscription = this.store
      .select(selectComicBookSelectionIds)
      .subscribe(ids => {
        this.selectedIds = ids;
        this.store.dispatch(loadComicsById({ ids: this.selectedIds }));
      });
    this.logger.trace('Subscribing to the comic detail list');
    this.comicDetailListSubscription = this.store
      .select(selectComicList)
      .subscribe(comics => {
        this.comics = comics;
      });
    this.logger.trace('Subscribing to the comic cover year list');
    this.comicDetailCoverYearSubscription = this.store
      .select(selectComicCoverYears)
      .subscribe(coverYears => {
        this.coverYears = coverYears;
      });
    this.logger.trace('Subscribing to the comic cover month list');
    this.comicDetailCoverMonthsSubscription = this.store
      .select(selectComicCoverMonths)
      .subscribe(coverMonths => {
        this.coverMonths = coverMonths;
      });
    this.logger.trace('Subscribing to process updates');
    this.processStateSubscription = this.store
      .select(selectMetadataUpdateProcessState)
      .subscribe(state => (this.processState = state));
    this.logger.trace('Subscribing to user updates');
    this.userSubscription = this.store
      .select(selectUser)
      .pipe(filter(user => !!user))
      .subscribe(user => {
        this.pageSize = parseInt(
          getUserPreference(
            user.preferences,
            PREFERENCE_PAGE_SIZE,
            `${PAGE_SIZE_DEFAULT}`
          ),
          10
        );
        this.showCovers =
          getUserPreference(
            user.preferences,
            SHOW_COMIC_COVERS_PREFERENCE,
            `$true`
          ) === `${true}`;
      });
  }

  ngAfterViewInit(): void {
    this.logger.trace('Loading the selected comic book id list');
    this.store.dispatch(loadComicBookSelections());
    this.loadTranslations();
  }

  ngOnDestroy(): void {
    this.logger.trace('Unsubscribing from language updates');
    this.langChangeSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from selection updates');
    this.selectIdSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from process state updates');
    this.processStateSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from comic book list updates');
    this.comicDetailListSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from comic cover year list updates');
    this.comicDetailCoverYearSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from comic cover month list updates');
    this.comicDetailCoverMonthsSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from user updates');
    this.userSubscription.unsubscribe();
  }

  private loadTranslations(): void {
    this.titleService.setTitle(
      this.translateService.instant('metadata-process.tab-title')
    );
  }
}
