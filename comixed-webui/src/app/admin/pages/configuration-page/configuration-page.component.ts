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
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { ConfigurationOption } from '@app/admin/models/configuration-option';
import {
  selectConfigurationOptionListState,
  selectConfigurationOptions
} from '@app/admin/selectors/configuration-option-list.selectors';
import { setBusyState } from '@app/core/actions/busy.actions';
import { TitleService } from '@app/core/services/title.service';
import { TranslateService } from '@ngx-translate/core';
import { loadConfigurationOptions } from '@app/admin/actions/configuration-option-list.actions';
import { QUERY_PARAM_TAB } from '@app/library/library.constants';
import { ActivatedRoute } from '@angular/router';
import { UrlParameterService } from '@app/core/services/url-parameter.service';

@Component({
  selector: 'cx-configuration-page',
  templateUrl: './configuration-page.component.html',
  styleUrls: ['./configuration-page.component.scss']
})
export class ConfigurationPageComponent implements OnInit, OnDestroy {
  configStateSubscription: Subscription;
  langChangeSubscription: Subscription;
  optionSubscription: Subscription;
  options: ConfigurationOption[] = [];
  queryParamSubscription: Subscription;
  currentTab = 0;

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private titleService: TitleService,
    private translateService: TranslateService,
    private activatedRoute: ActivatedRoute,
    private urlParameterService: UrlParameterService
  ) {
    this.queryParamSubscription = this.activatedRoute.queryParams.subscribe(
      params => {
        if (+params[QUERY_PARAM_TAB]) {
          this.logger.debug(
            'Setting configuration tab:',
            params[QUERY_PARAM_TAB]
          );
          this.currentTab = +params[QUERY_PARAM_TAB];
        }
      }
    );
    this.configStateSubscription = this.store
      .select(selectConfigurationOptionListState)
      .subscribe(state => {
        this.store.dispatch(
          setBusyState({ enabled: state.loading || state.saving })
        );
      });
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.optionSubscription = this.store
      .select(selectConfigurationOptions)
      .subscribe(options => (this.options = options));
  }

  ngOnInit(): void {
    this.loadTranslations();
    this.store.dispatch(loadConfigurationOptions());
  }

  ngOnDestroy(): void {
    this.configStateSubscription.unsubscribe();
    this.langChangeSubscription.unsubscribe();
    this.optionSubscription.unsubscribe();
  }

  onTabChange(index: number): void {
    this.logger.trace('Tab changed:', index);
    this.urlParameterService.updateQueryParam([
      {
        name: QUERY_PARAM_TAB,
        value: `${index}`
      }
    ]);
  }

  private loadTranslations(): void {
    this.titleService.setTitle(
      this.translateService.instant('configuration.tab-title')
    );
  }
}
