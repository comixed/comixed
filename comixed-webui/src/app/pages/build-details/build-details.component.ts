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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Subscription } from 'rxjs';
import { BuildDetails } from '@app/models/build-details';
import { selectBuildDetailsState } from '@app/selectors/build-details.selectors';
import { setBusyState } from '@app/core/actions/busy.actions';
import { loadBuildDetails } from '@app/actions/build-details.actions';
import { TitleService } from '@app/core/services/title.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'cx-build-details',
  templateUrl: './build-details.component.html',
  styleUrls: ['./build-details.component.scss']
})
export class BuildDetailsComponent implements OnInit, OnDestroy {
  detailsSubscription: Subscription;
  details: BuildDetails;
  langChangeSubscription: Subscription;

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private translateService: TranslateService,
    private titleService: TitleService
  ) {
    this.detailsSubscription = this.store
      .select(selectBuildDetailsState)
      .subscribe(state => {
        this.store.dispatch(setBusyState({ enabled: state.loading }));
        this.details = state.details;
      });
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
  }

  ngOnInit(): void {
    this.store.dispatch(loadBuildDetails());
    this.loadTranslations();
  }

  ngOnDestroy(): void {
    this.logger.trace('Unsubscribing from language changes');
    this.langChangeSubscription.unsubscribe();
  }

  private loadTranslations(): void {
    this.logger.trace('Setting tab title');
    this.titleService.setTitle(
      this.translateService.instant('build-details.tab-title')
    );
  }
}
