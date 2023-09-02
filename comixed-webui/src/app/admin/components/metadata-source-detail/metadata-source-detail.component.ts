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

import { Component, Inject, Input } from '@angular/core';
import { MetadataSource } from '@app/comic-metadata/models/metadata-source';
import {
  AbstractControl,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators
} from '@angular/forms';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import { MetadataSourceProperty } from '@app/comic-metadata/models/metadata-source-property';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfirmationService } from '@tragically-slick/confirmation';
import { TranslateService } from '@ngx-translate/core';
import { saveMetadataSource } from '@app/comic-metadata/actions/metadata-source.actions';

@Component({
  selector: 'cx-metadata-source-detail',
  templateUrl: './metadata-source-detail.component.html',
  styleUrls: ['./metadata-source-detail.component.scss']
})
export class MetadataSourceDetailComponent {
  sourceForm: UntypedFormGroup;

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private formBuilder: UntypedFormBuilder,
    private confirmationService: ConfirmationService,
    private translateService: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: { source: MetadataSource }
  ) {
    this.sourceForm = this.formBuilder.group({
      name: [
        '',
        [Validators.required, Validators.minLength(3), Validators.maxLength(64)]
      ],
      beanName: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(255)
        ]
      ],
      preferredSource: [''],
      properties: this.formBuilder.array([])
    });
    this.source = this.data.source;
  }

  private _source: MetadataSource;

  get source(): MetadataSource {
    return this._source;
  }

  @Input() set source(source: MetadataSource) {
    this._source = source;
    this.logger.debug('Loading metadata source form');
    this.resetProperties();
    this.sourceForm.controls.properties.reset([]);
    this.sourceForm.controls.name.setValue(source.name);
    this.sourceForm.controls.beanName.setValue(source.beanName);
    this.sourceForm.controls.preferredSource.setValue(source.preferred);
    this.logger.debug('Loading metadata source properties');
    source.properties.forEach(property =>
      this.addSourceProperty(property.name, property.value)
    );
    this.sourceForm.markAsPristine();
  }

  get properties(): UntypedFormArray {
    return this.sourceForm.controls.properties as UntypedFormArray;
  }

  get controls(): { [p: string]: AbstractControl } {
    return this.sourceForm.controls;
  }

  addSourceProperty(name: string, value: string): void {
    this.properties.push(
      this.formBuilder.group({
        propertyName: [
          name,
          [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(32)
          ]
        ],
        propertyValue: [
          value,
          [
            Validators.required,
            Validators.minLength(1),
            Validators.maxLength(255)
          ]
        ]
      })
    );
  }

  encodeForm(): MetadataSource {
    this.logger.debug('Encoding metadata source form');
    return {
      ...this.source,
      name: this.sourceForm.controls.name.value,
      beanName: this.sourceForm.controls.beanName.value,
      preferred: this.sourceForm.controls.preferredSource.value,
      properties: this.properties.controls.map(control => {
        return {
          name: control.value.propertyName,
          value: control.value.propertyValue
        } as MetadataSourceProperty;
      })
    };
  }

  onDeleteProperty(propertyName: string): void {
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'metadata-source.delete-property.confirmation-title'
      ),
      message: this.translateService.instant(
        'metadata-source.delete-property.confirmation-message',
        { name: propertyName }
      ),
      confirm: () => {
        this.logger.debug('Removing property:', propertyName);
        this.properties.removeAt(
          this.properties.controls.findIndex(
            entry => entry.value.propertyName === propertyName
          )
        );
        this.sourceForm.markAsDirty();
      }
    });
  }

  onSave(): void {
    const source = this.encodeForm();
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'metadata-source.save-source.confirmation-title'
      ),
      message: this.translateService.instant(
        'metadata-source.save-source.confirmation-message',
        { name: source.name }
      ),
      confirm: () => {
        this.logger.debug('Saving metadata source:', source);
        this.store.dispatch(saveMetadataSource({ source }));
      }
    });
  }

  onReset(): void {
    this.logger.debug('Resetting metadata source changes');
    this.source = this.data.source;
  }

  onAddProperty(): void {
    this.addSourceProperty(`property-${this.properties.length + 1}`, '');
  }

  private resetProperties(): void {
    while (this.properties.length > 0) {
      this.properties.removeAt(0);
    }
  }
}
