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

import { Component, inject } from '@angular/core';
import { LibraryPlugin } from '@app/library-plugins/models/library-plugin';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  UntypedFormArray,
  Validators
} from '@angular/forms';
import {
  setCurrentLibraryPlugin,
  updateLibraryPlugin
} from '@app/library-plugins/actions/library-plugin.actions';
import { ConfirmationService } from '@tragically-slick/confirmation';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardTitle
} from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { PluginTitlePipe } from '../../../library-plugins/pipes/plugin-title.pipe';
import { LibraryPluginProperty } from '@app/library-plugins/models/library-plugin-property';

@Component({
  selector: 'cx-library-plugin-setup',
  templateUrl: './library-plugin-setup.component.html',
  styleUrls: ['./library-plugin-setup.component.scss'],
  imports: [
    ReactiveFormsModule,
    MatCard,
    MatCardTitle,
    MatCardContent,
    MatFormField,
    MatInput,
    MatCardActions,
    MatButton,
    MatIcon,
    MatLabel,
    TranslateModule,
    PluginTitlePipe
  ]
})
export class LibraryPluginSetupComponent {
  pluginFormGroup: FormGroup;

  logger = inject(LoggerService);
  store = inject(Store);
  formBuilder = inject(FormBuilder);
  confirmationService = inject(ConfirmationService);
  translateService = inject(TranslateService);
  plugin = inject<LibraryPlugin>(MAT_DIALOG_DATA);

  constructor() {
    this.logger.trace('Setting up the plugin form group');
    this.pluginFormGroup = this.formBuilder.group({
      filename: [''],
      properties: this.formBuilder.array([])
    });
    this.loadPluginProperties();
  }

  get properties(): UntypedFormArray {
    return this.pluginFormGroup.controls.properties as UntypedFormArray;
  }

  onSave(): void {
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'library-plugin-setup.save.confirmation-title'
      ),
      message: this.translateService.instant(
        'library-plugin-setup.save.confirmation-message',
        {
          name: this.plugin.name,
          language: this.plugin.language
        }
      ),
      confirm: () => {
        const plugin = this.encodePlugin();
        this.logger.debug('Saving library plugin updates:', plugin);
        this.store.dispatch(updateLibraryPlugin({ plugin }));
      }
    });
  }

  onReset(): void {
    this.loadPluginProperties();
  }

  onClose(): void {
    this.store.dispatch(setCurrentLibraryPlugin({ plugin: null }));
  }

  encodePlugin(): LibraryPlugin {
    return {
      ...this.plugin,
      properties: this.properties.controls.map(control => {
        const property = this.plugin.properties.find(
          entry => entry.name === control.value.propertyName
        );
        return {
          ...property,
          value: control.value.propertyValue
        } as LibraryPluginProperty;
      })
    };
  }

  private loadPluginProperties(): void {
    while (this.properties.length > 0) {
      this.properties.removeAt(0);
    }

    this.plugin.properties.forEach(property => {
      const propertyFormField = this.formBuilder.group({
        propertyName: [property.name, [Validators.required]],
        propertyValue: [
          property.value,
          property.required
            ? [
                Validators.required,
                Validators.minLength(1),
                Validators.maxLength(property.length)
              ]
            : [Validators.maxLength(property.length)]
        ]
      });
      this.properties.push(propertyFormField);
    });
  }
}
