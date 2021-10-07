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

import { Component, Input, OnInit } from '@angular/core';
import { LoggerService } from '@angular-ru/logger';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { ConfigurationOption } from '@app/admin/models/configuration-option';
import { getConfigurationOption } from '@app/admin';
import { COMICVINE_API_KEY } from '@app/admin/admin.constants';
import { saveConfigurationOptions } from '@app/admin/actions/save-configuration-options.actions';
import { ConfirmationService } from '@app/core/services/confirmation.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'cx-comic-vine-configuration',
  templateUrl: './comic-vine-configuration.component.html',
  styleUrls: ['./comic-vine-configuration.component.scss']
})
export class ComicVineConfigurationComponent implements OnInit {
  comicVineConfigForm: FormGroup;

  constructor(
    private logger: LoggerService,
    private formBuilder: FormBuilder,
    private store: Store<any>,
    private confirmationService: ConfirmationService,
    private translateService: TranslateService
  ) {
    this.comicVineConfigForm = this.formBuilder.group({
      apiKey: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]{40}')]]
    });
  }

  @Input() set options(options: ConfigurationOption[]) {
    this.comicVineConfigForm.controls.apiKey.setValue(
      getConfigurationOption(options, COMICVINE_API_KEY, '')
    );
  }

  ngOnInit(): void {}

  onSave(): void {
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

  private encodeOptions(): ConfigurationOption[] {
    return [
      {
        name: COMICVINE_API_KEY,
        value: this.comicVineConfigForm.controls.apiKey.value
      }
    ];
  }
}
