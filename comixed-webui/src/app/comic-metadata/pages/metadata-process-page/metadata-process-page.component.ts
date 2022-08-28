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

@Component({
  selector: 'cx-metadata-process-page',
  templateUrl: './metadata-process-page.component.html',
  styleUrls: ['./metadata-process-page.component.scss']
})
export class MetadataProcessPageComponent implements OnDestroy, AfterViewInit {
  langChangeSubscription: Subscription;
  selectIdSubscription: Subscription;
  processStateSubscription: Subscription;
  processState: MetadataUpdateProcessState;
  selectedIds: number[] = [];

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
      .subscribe(ids => (this.selectedIds = ids));
    this.logger.trace('Subscribing to process updates');
    this.processStateSubscription = this.store
      .select(selectMetadataUpdateProcessState)
      .subscribe(state => (this.processState = state));
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
  }

  private loadTranslations(): void {
    this.titleService.setTitle(
      this.translateService.instant('metadata-process.tab-title')
    );
  }
}
