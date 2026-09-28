/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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

import {
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  signal
} from '@angular/core';
import { TableModule } from '@openng/optimus-ui/table';
import { Store } from '@ngrx/store';
import { LoggerService } from '@angular-ru/cdk/logger';
import {
  selectSingleComicScrapingBusy,
  selectSingleComicScrapingEntries,
  selectSingleComicScrapingIssue
} from '@app/metadata/selectors/single-comic-scraping.selectors';
import { TranslatePipe } from '@ngx-translate/core';
import { DecimalPipe } from '@angular/common';
import { ScrapingVolume } from '@app/metadata/models/scraping-volume';
import { SingleComicScrapingActions } from '@app/metadata/actions/single-comic-scraping.actions';
import { MetadataSource } from '@app/metadata/models/metadata-source';
import { ScrapingIssueTitlePipe } from '@app/metadata/pipes/scraping-issue-title-pipe';
import { Card } from '@openng/optimus-ui/card';
import { Button } from '@openng/optimus-ui/button';
import { Tooltip } from '@openng/optimus-ui/tooltip';
import { ScrapingIssue } from '@app/metadata/models/scraping-issue';

@Component({
  imports: [
    TableModule,
    TranslatePipe,
    DecimalPipe,
    ScrapingIssueTitlePipe,
    Card,
    Button,
    Tooltip
  ],
  selector: 'app-scraping-volume-table',
  styleUrl: './scraping-volume-table.scss',
  templateUrl: './scraping-volume-table.html'
})
export class ScrapingVolumeTable {
  readonly logger = inject(LoggerService);
  readonly store = inject(Store);
  readonly scrapingVolumes = this.store.selectSignal(
    selectSingleComicScrapingEntries
  );
  readonly scrapingBusy = this.store.selectSignal(
    selectSingleComicScrapingBusy
  );
  readonly scrapingIssue = this.store.selectSignal(
    selectSingleComicScrapingIssue
  );
  readonly scrapingVolumesRows = signal(10);
  readonly scrapingVolumesFirst = signal(0);

  @Input() metadataSource!: MetadataSource;
  @Input() issueNumber = '';
  @Input() skipCache = false;

  @Output() issueSelected = new EventEmitter<ScrapingIssue>();

  onRowSelect(selectedVolume: ScrapingVolume | ScrapingVolume[] | null): void {
    if (selectedVolume && !Array.isArray(selectedVolume)) {
      this.logger.debug('Loading issue detail for volume:', selectedVolume);
      this.store.dispatch(
        SingleComicScrapingActions.loadIssue({
          metadataSource: this.metadataSource,
          volumeId: selectedVolume.id,
          issueNumber: this.issueNumber,
          skipCache: this.skipCache
        })
      );
    }
  }

  onResetVolumes(): void {
    this.store.dispatch(SingleComicScrapingActions.resetVolumes());
  }
}
