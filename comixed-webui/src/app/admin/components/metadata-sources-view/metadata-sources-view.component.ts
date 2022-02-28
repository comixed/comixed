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

import { Component, OnDestroy, ViewChild } from '@angular/core';
import { MetadataSource } from '@app/comic-metadata/models/metadata-source';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { selectMetadataSource } from '@app/comic-metadata/selectors/metadata-source.selectors';
import {
  clearMetadataSource,
  deleteMetadataSource,
  metadataSourceLoaded,
  saveMetadataSource
} from '@app/comic-metadata/actions/metadata-source.actions';
import { MetadataSourceDetailComponent } from '@app/admin/components/metadata-source-detail/metadata-source-detail.component';
import { ConfirmationService } from '@tragically-slick/confirmation';
import { TranslateService } from '@ngx-translate/core';
import { METADATA_SOURCE_TEMPLATE } from '@app/comic-metadata/comic-metadata.constants';

@Component({
  selector: 'cx-metadata-sources-view',
  templateUrl: './metadata-sources-view.component.html',
  styleUrls: ['./metadata-sources-view.component.scss']
})
export class MetadataSourcesViewComponent implements OnDestroy {
  @ViewChild(MetadataSourceDetailComponent)
  sourceDetail: MetadataSourceDetailComponent;

  currentSourceSubscription: Subscription;
  currentSource: MetadataSource;

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private confirmationService: ConfirmationService,
    private translateService: TranslateService
  ) {
    this.currentSourceSubscription = this.store
      .select(selectMetadataSource)
      .subscribe(source => (this.currentSource = source));
  }

  ngOnDestroy(): void {
    this.logger.trace('Unsubscribing from metadat source updates');
    this.currentSourceSubscription.unsubscribe();
  }

  onReturnToList(): void {
    this.logger.trace('Returning to the metadata source list');
    this.store.dispatch(clearMetadataSource());
  }

  onResetSource(): void {
    this.logger.trace('Resetting metadata source changes');
    this.store.dispatch(
      metadataSourceLoaded({ source: { ...this.currentSource } })
    );
  }

  onAddProperty(): void {
    this.logger.trace('Adding new metadata source property');
    this.sourceDetail.addSourceProperty('', '');
  }

  onSaveSource() {
    this.logger.trace('Confirming save metadata source');
    const source = this.sourceDetail.encodeForm();
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'metadata-source.save-source.confirm-title'
      ),
      message: this.translateService.instant(
        'metadata-source.save-source.confirm-message',
        { name: source.name }
      ),
      confirm: () => {
        this.logger.debug('Saving metadata source:', source);
        this.store.dispatch(saveMetadataSource({ source }));
      }
    });
  }

  onDeleteSource(): void {
    this.logger.trace('Confirming delete metadata source');
    const source = this.currentSource;
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'metadata-source.delete-source.confirm-title'
      ),
      message: this.translateService.instant(
        'metadata-source.delete-source.confirm-message',
        { name: source.name }
      ),
      confirm: () => {
        this.logger.debug('Deleting metadata source');
        this.store.dispatch(deleteMetadataSource({ source }));
      }
    });
  }

  onCreateSource(): void {
    this.logger.trace('Creating new metadata source');
    this.store.dispatch(
      metadataSourceLoaded({ source: METADATA_SOURCE_TEMPLATE })
    );
  }
}
