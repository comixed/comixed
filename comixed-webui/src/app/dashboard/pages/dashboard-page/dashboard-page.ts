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
import { CollectionStatistics } from '@app/dashboard/components/collection-statistics/collection-statistics';
import { ComicStateStatistics } from '@app/dashboard/components/comic-state-statistics/comic-state-statistics';
import { PublisherYearStatistics } from '@app/dashboard/components/publisher-year-statistics/publisher-year-statistics';
import { LibraryStore } from '@app/library/stores/library-store';
import { ArchiveTypeStatistics } from '@app/dashboard/components/archive-type-statistics/archive-type-statistics';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  imports: [
    CollectionStatistics,
    ComicStateStatistics,
    PublisherYearStatistics,
    ArchiveTypeStatistics,
    TranslatePipe
  ],
  selector: 'app-dashboard-page',
  styleUrl: './dashboard-page.scss',
  templateUrl: './dashboard-page.html'
})
export class DashboardPage {
  stats = signal<string[]>([]);
  libraryStore = inject(LibraryStore);

  constructor() {
    this.stats.set(DEFAULT_DASHBOARD_STATS.split('|'));
  }
}
