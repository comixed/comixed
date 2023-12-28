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

import { Component, Inject } from '@angular/core';
import {
  LibraryPlugin,
  LibraryPluginProperty
} from '@app/library-plugins/models/library-plugin';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  FormBuilder,
  FormGroup,
  UntypedFormArray,
  Validators
} from '@angular/forms';
import {
  setCurrentLibraryPlugin,
  updateLibraryPlugin
} from '@app/library-plugins/actions/library-plugin.actions';
import { ConfirmationService } from '@tragically-slick/confirmation';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'cx-library-plugin-setup',
  templateUrl: './library-plugin-setup.component.html',
  styleUrls: ['./library-plugin-setup.component.scss']
})
export class LibraryPluginSetupComponent {
  pluginFormGroup: FormGroup;

  constructor(
    private logger: LoggerService,
    private store: Store,
    private formBuilder: FormBuilder,
    private confirmationService: ConfirmationService,
    private translateService: TranslateService,
    @Inject(MAT_DIALOG_DATA) public plugin: LibraryPlugin
  ) {
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
          version: this.plugin.version
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
          [
            Validators.required,
            Validators.minLength(1),
            Validators.maxLength(property.length)
          ]
        ]
      });
      this.properties.push(propertyFormField);
    });
  }
}
