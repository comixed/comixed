/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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
import { loadPluginLanguages } from '@app/library-plugins/actions/plugin-language.actions';
import { Subscription } from 'rxjs';
import { PluginLanguage } from '@app/library-plugins/models/plugin-language';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  selectPluginLanguageList,
  selectPluginLanguageState
} from '@app/library-plugins/selectors/plugin-language.selectors';
import { PluginLanguageState } from '@app/library-plugins/reducers/plugin-language.reducer';
import { ConfirmationService } from '@tragically-slick/confirmation';
import { TranslateService } from '@ngx-translate/core';
import { createLibraryPlugin } from '@app/library-plugins/actions/library-plugin.actions';

@Component({
  selector: 'cx-create-plugin-dialog',
  templateUrl: './create-plugin-dialog.component.html',
  styleUrls: ['./create-plugin-dialog.component.scss']
})
export class CreatePluginDialogComponent implements OnInit, OnDestroy {
  pluginLanguageStateSubscription: Subscription;
  pluginLanguageState: PluginLanguageState;
  pluginLanguageListSubscription: Subscription;
  pluginLanguageList: PluginLanguage[] = [];
  pluginForm: FormGroup;

  constructor(
    private logger: LoggerService,
    private store: Store,
    private formBuilder: FormBuilder,
    private confirmationService: ConfirmationService,
    private translateService: TranslateService
  ) {
    this.logger.trace('Subscribing to plugin language state updates');
    this.pluginLanguageStateSubscription = this.store
      .select(selectPluginLanguageState)
      .subscribe(state => {
        this.pluginLanguageState = state;
      });
    this.logger.trace('Subscribing to plugin language list updates');
    this.pluginLanguageListSubscription = this.store
      .select(selectPluginLanguageList)
      .subscribe(list => (this.pluginLanguageList = list));
    this.pluginForm = this.formBuilder.group({
      filename: [
        '',
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(1024)
        ]
      ],
      language: ['', [Validators.required]]
    });
  }

  ngOnDestroy(): void {
    this.logger.trace('Unsubscribing from plugin language list updates');
    this.pluginLanguageListSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.logger.trace('Loading plugin languages');
    this.store.dispatch(loadPluginLanguages());
  }

  onCreatePlugin(): void {
    this.confirmationService.confirm({
      title: this.translateService.instant('create-plugin.confirmation-title'),
      message: this.translateService.instant(
        'create-plugin.confirmation-message'
      ),
      confirm: () => {
        const language = this.pluginForm.controls.language.value;
        const filename = this.pluginForm.controls.filename.value;
        this.logger.trace('Creating plugin:', language, filename);
        this.store.dispatch(createLibraryPlugin({ language, filename }));
      }
    });
  }
}
