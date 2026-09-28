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

import { Component, Input, signal } from '@angular/core';
import { RemoteLibrarySegment } from '@app/library/models/net/remote-library-segment';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { BarChartModule, PieChartModule } from '@swimlane/ngx-charts';

@Component({
  imports: [
    MatCard,
    MatCardContent,
    MatCardTitle,
    PieChartModule,
    BarChartModule
  ],
  selector: 'app-comic-state-statistics',
  styleUrl: './comic-state-statistics.scss',
  templateUrl: './comic-state-statistics.html'
})
export class ComicStateStatistics {
  @Input() title = '';
  readonly chartData = signal<{ name: string; value: number }[]>([]);

  @Input() set statistics(statistics: RemoteLibrarySegment[]) {
    this.chartData.set(
      Array.from(
        statistics.map(entry => {
          return { name: entry.name, value: entry.count };
        })
      )
    );
  }
}
