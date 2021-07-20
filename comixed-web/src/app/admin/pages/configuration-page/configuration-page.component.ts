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
import { LoggerService } from '@angular-ru/logger';
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
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService } from '@app/core/services/confirmation.service';
import { saveConfigurationOptions } from '@app/admin/actions/save-configuration-options.actions';
import {
  COMICVINE_API_KEY,
  LIBRARY_CONSOLIDATION_RULE
} from '@app/admin/admin.constants';
import { loadConfigurationOptions } from '@app/admin/actions/configuration-option-list.actions';
import { updateQueryParam } from '@app/core';
import { QUERY_PARAM_TAB } from '@app/library/library.constants';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'cx-configuration-page',
  templateUrl: './configuration-page.component.html',
  styleUrls: ['./configuration-page.component.scss']
})
export class ConfigurationPageComponent implements OnInit, OnDestroy {
  configStateSubscription: Subscription;
  langChangeSubscription: Subscription;
  optionSubscription: Subscription;
  mappings = [
    { name: COMICVINE_API_KEY, control: 'apiKey' },
    {
      name: LIBRARY_CONSOLIDATION_RULE,
      control: 'consolidationRule'
    }
  ];
  configurationForm: FormGroup;
  queryParamSubscription: Subscription;
  currentTab = 0;

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private titleService: TitleService,
    private translateService: TranslateService,
    private formBuilder: FormBuilder,
    private confirmationService: ConfirmationService,
    private activatedRoute: ActivatedRoute,
    private router: Router
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
    this.configurationForm = this.formBuilder.group({
      consolidationRule: ['', [Validators.required]],
      apiKey: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]{40}')]]
    });
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

  set options(options: ConfigurationOption[]) {
    options.forEach(option => {
      const mapping = this.mappings.find(entry => entry.name === option.name);
      if (!!mapping) {
        this.configurationForm.controls[mapping.control].setValue(option.value);
      }
    });
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

  onSaveConfiguration(): void {
    this.logger.trace('Save configuration called');
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'save-configuration.confirmation-title'
      ),
      message: this.translateService.instant(
        'save-configuration.confirmation-message'
      ),
      confirm: () => {
        this.logger.trace('Save configuration confirmed');
        this.store.dispatch(
          saveConfigurationOptions({ options: this.encodeOptions() })
        );
      }
    });
  }

  onTabChange(index: number): void {
    this.logger.trace('Tab changed:', index);
    updateQueryParam(
      this.activatedRoute,
      this.router,
      QUERY_PARAM_TAB,
      `${index}`
    );
  }

  private loadTranslations(): void {
    this.titleService.setTitle(
      this.translateService.instant('configuration.tab-title')
    );
  }

  private encodeOptions(): ConfigurationOption[] {
    return this.mappings.map(entry => {
      return {
        name: entry.name,
        value: this.configurationForm.controls[entry.control].value
      };
    });
  }
}
