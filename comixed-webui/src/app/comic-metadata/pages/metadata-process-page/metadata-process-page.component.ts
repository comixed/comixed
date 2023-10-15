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

import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import { selectLibrarySelections } from '@app/library/selectors/library-selections.selectors';
import { TitleService } from '@app/core/services/title.service';
import { TranslateService } from '@ngx-translate/core';
import { selectMetadataUpdateProcessState } from '@app/comic-metadata/selectors/metadata-update-process.selectors';
import { MetadataUpdateProcessState } from '@app/comic-metadata/reducers/metadata-update-process.reducer';
import { selectComicBookList } from '@app/comic-books/selectors/comic-book-list.selectors';
import { SHOW_COMIC_COVERS_PREFERENCE } from '@app/library/library.constants';
import { selectUser } from '@app/user/selectors/user.selectors';
import { getUserPreference } from '@app/user';
import { filter } from 'rxjs/operators';
import { PAGE_SIZE_DEFAULT, PAGE_SIZE_PREFERENCE } from '@app/core';
import { ComicDetail } from '@app/comic-books/models/comic-detail';

@Component({
  selector: 'cx-metadata-process-page',
  templateUrl: './metadata-process-page.component.html',
  styleUrls: ['./metadata-process-page.component.scss']
})
export class MetadataProcessPageComponent implements OnDestroy, AfterViewInit {
  comicDetails: ComicDetail[] = [];

  langChangeSubscription: Subscription;
  selectIdSubscription: Subscription;
  comicBooksSubscription: Subscription;
  processStateSubscription: Subscription;
  processState: MetadataUpdateProcessState;
  selectedIds: number[] = [];
  userSubscription: Subscription;
  pageSize = PAGE_SIZE_DEFAULT;
  showCovers = false;
  private _comics: ComicDetail[] = [];

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private titleService: TitleService,
    private translateService: TranslateService
  ) {
    this.logger.trace('Subscribing to language change events');
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.logger.trace('Subscribing to selection updates');
    this.selectIdSubscription = this.store
      .select(selectLibrarySelections)
      .subscribe(ids => {
        this.selectedIds = ids;
      });
    this.logger.trace('Subscribing to the comic book list');
    this.comicBooksSubscription = this.store
      .select(selectComicBookList)
      .subscribe(comicDetails => {
        this.comicDetails = comicDetails;
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
            PAGE_SIZE_PREFERENCE,
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
    this.comicBooksSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from user updates');
    this.userSubscription.unsubscribe();
  }

  private loadTranslations(): void {
    this.titleService.setTitle(
      this.translateService.instant('metadata-process.tab-title')
    );
  }
}
