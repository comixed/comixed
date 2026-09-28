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
import { PublisherAndYearSegment } from '@app/library/models/net/publisher-and-year-segment';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@Component({
  imports: [MatCard, MatCardContent, MatCardTitle, NgxChartsModule],
  selector: 'app-publisher-year-statistics',
  styleUrl: './publisher-year-statistics.scss',
  templateUrl: './publisher-year-statistics.html'
})
export class PublisherYearStatistics {
  @Input() title = '';

  readonly chartData = signal<
    { name: string; series: { name: string; value: number }[] }[]
  >([]);

  @Input() set statistics(statistics: PublisherAndYearSegment[]) {
    const years = Array.from(
      new Set(statistics.map(entry => entry.year))
    ).sort();
    this.chartData.set(
      years.map(year => {
        return {
          name: `${year}`,
          series: statistics
            .filter(entry => entry.year === year)
            .map(entry => {
              return {
                name: entry.publisher,
                value: entry.count
              };
            })
        };
      })
    );
  }

  get chartOptions() {
    return {
      animations: null,
      plugins: { legend: { display: false } },
      responsive: true
    };
  }
}
