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

import { Component, inject, signal } from '@angular/core';
import { DEFAULT_DASHBOARD_STATS } from '@app/dashboard/dashboard-constants';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { TitleService } from '@app/layout/services/title-service';
import { CollectionStatistics } from '@app/dashboard/components/collection-statistics/collection-statistics';
import { Store } from '@ngrx/store';
import {
  selectRemoteLibraryArchiveTypes,
  selectRemoteLibraryByPublisherAndYear,
  selectRemoteLibraryCharacters,
  selectRemoteLibraryLocations,
  selectRemoteLibraryPublishers,
  selectRemoteLibrarySeries,
  selectRemoteLibraryStates,
  selectRemoteLibraryStories,
  selectRemoteLibraryTeams
} from '@app/library/selectors/remote-library.selectors';
import { RemoteLibrarySegment } from '@app/library/models/net/remote-library-segment';
import { CollectionGraphWidget } from '@app/dashboard/components/library-graph-widget/collection-graph-widget';
import { DistributionStatistics } from '@app/dashboard/components/distribution-statistics/distribution-statistics';

@Component({
  imports: [
    TranslatePipe,
    CollectionStatistics,
    CollectionGraphWidget,
    DistributionStatistics
  ],
  selector: 'app-dashboard-page',
  styleUrl: './dashboard-page.scss',
  templateUrl: './dashboard-page.html'
})
export class DashboardPage {
  readonly stats = signal<string[]>([]);
  readonly store = inject(Store);
  readonly publishers = this.store.selectSignal(selectRemoteLibraryPublishers);
  readonly series = this.store.selectSignal(selectRemoteLibrarySeries);
  readonly characters = this.store.selectSignal(selectRemoteLibraryCharacters);
  readonly teams = this.store.selectSignal(selectRemoteLibraryTeams);
  readonly locations = this.store.selectSignal(selectRemoteLibraryLocations);
  readonly stories = this.store.selectSignal(selectRemoteLibraryStories);
  readonly comicStates = this.store.selectSignal(selectRemoteLibraryStates);
  readonly archiveTypes = this.store.selectSignal(
    selectRemoteLibraryArchiveTypes
  );
  readonly byPublisherAndYear = this.store.selectSignal(
    selectRemoteLibraryByPublisherAndYear
  );
  readonly titleService = inject(TitleService);
  readonly translateService = inject(TranslateService);
  readonly zoomedStatistics = signal<RemoteLibrarySegment[]>([]);
  readonly zoomedTitle = signal('');

  constructor() {
    this.translateService.onLangChange.subscribe({
      next: () => this.doLoadTranslations()
    });
    this.stats.set(DEFAULT_DASHBOARD_STATS.split('|'));
    this.doLoadTranslations();
  }

  onZoom(statistics: RemoteLibrarySegment[], title: string) {
    this.zoomedTitle.set(title);
    this.zoomedStatistics.set(statistics);
  }

  onUnzoom(): void {
    this.zoomedStatistics.set([]);
  }

  private doLoadTranslations() {
    this.titleService.setTitle(
      this.translateService.instant('dashboard.page-title')
    );
  }
}
