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

import { Component, Input } from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import { ConfirmationService } from '@tragically-slick/confirmation';
import { TranslateService } from '@ngx-translate/core';
import { startMetadataUpdateProcess } from '@app/comic-metadata/actions/metadata.actions';

@Component({
  selector: 'cx-metadata-process-toolbar',
  templateUrl: './metadata-process-toolbar.component.html',
  styleUrls: ['./metadata-process-toolbar.component.scss']
})
export class MetadataProcessToolbarComponent {
  @Input() selectedIds: number[] = [];

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private confirmationService: ConfirmationService,
    private translateService: TranslateService
  ) {}

  onStartBatchProcess(): void {
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'metadata-process.start-process.confirm-title'
      ),
      message: this.translateService.instant(
        'metadata-process.start-process.confirm-message',
        { count: this.selectedIds.length }
      ),
      confirm: () => {
        this.logger.trace('Beginning metadata batch processing');
        this.store.dispatch(
          startMetadataUpdateProcess({
            ids: this.selectedIds,
            skipCache: false
          })
        );
      }
    });
  }
}
