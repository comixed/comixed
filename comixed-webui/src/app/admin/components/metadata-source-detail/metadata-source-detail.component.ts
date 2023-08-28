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

import { Component, EventEmitter, Input, Output } from '@angular/core';
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
import {
  deleteMetadataSource,
  saveMetadataSource
} from '@app/comic-metadata/actions/metadata-source.actions';
import { ConfirmationService } from '@tragically-slick/confirmation';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'cx-metadata-source-detail',
  templateUrl: './metadata-source-detail.component.html',
  styleUrls: ['./metadata-source-detail.component.scss']
})
export class MetadataSourceDetailComponent {
  sourceForm: UntypedFormGroup;

  @Output() saveSource = new EventEmitter<void>();

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private formBuilder: UntypedFormBuilder,
    private confirmationService: ConfirmationService,
    private translateService: TranslateService
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
      properties: this.formBuilder.array([])
    });
  }

  private _source: MetadataSource;

  get source(): MetadataSource {
    return this._source;
  }

  @Input() set source(source: MetadataSource) {
    this._source = source;
    this.loadSourceForm();
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
      properties: this.properties.controls.map(control => {
        return {
          name: control.value.propertyName,
          value: control.value.propertyValue
        } as MetadataSourceProperty;
      })
    };
  }

  onDeleteProperty(name: string): void {
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'metadata-source.delete-property.confirmation-title'
      ),
      message: this.translateService.instant(
        'metadata-source.delete-property.confirmation-message',
        { name }
      ),
      confirm: () => {
        this.logger.debug('Removing property:', name);
        this.properties.removeAt(
          this.properties.controls.findIndex(
            entry => entry.value.propertyName === name
          )
        );
        this.sourceForm.markAsDirty();
      }
    });
  }

  onResetSource() {
    this.logger.debug('Resetting input form');
    this.loadSourceForm();
  }

  onSaveSource(): void {
    this.logger.debug('Confirming save metadata source');
    const source = this.encodeForm();
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'metadata-source.save-source.confirm-title'
      ),
      message: this.translateService.instant(
        'metadata-source.save-source.confirm-message',
        { name: this.source.name }
      ),
      confirm: () => {
        this.logger.debug('Saving metadata source:', this.source);
        this.store.dispatch(saveMetadataSource({ source }));
        this.saveSource.emit();
      }
    });
  }

  onDeleteSource(): void {
    this.logger.debug('Confirming delete metadata source');
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'metadata-source.delete-source.confirm-title'
      ),
      message: this.translateService.instant(
        'metadata-source.delete-source.confirm-message',
        { name: this.source.name }
      ),
      confirm: () => {
        this.logger.debug('Deleting metadata source');
        this.store.dispatch(deleteMetadataSource({ source: this.source }));
        this.saveSource.emit();
      }
    });
  }

  private loadSourceForm(): void {
    this.logger.debug('Loading metadata source form');
    this.resetProperties();
    this.sourceForm.controls.properties.reset([]);
    this.sourceForm.controls.name.setValue(this.source.name);
    this.sourceForm.controls.beanName.setValue(this.source.beanName);
    this.logger.debug('Loading metadata source properties');
    this.source.properties.forEach(property =>
      this.addSourceProperty(property.name, property.value)
    );
    this.sourceForm.markAsPristine();
  }

  private resetProperties(): void {
    while (this.properties.length > 0) {
      this.properties.removeAt(0);
    }
  }
}
