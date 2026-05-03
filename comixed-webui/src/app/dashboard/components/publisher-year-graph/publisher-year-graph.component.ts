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

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ByPublisherAndYearSegment } from '@app/library/models/net/by-publisher-and-year-segment';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardTitle
} from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { BarChartModule, HeatMapModule } from '@swimlane/ngx-charts';
import { BehaviorSubject } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'cx-publisher-year-graph',
  imports: [
    MatCard,
    MatCardTitle,
    MatCardContent,
    MatCardActions,
    MatIcon,
    BarChartModule,
    HeatMapModule,
    AsyncPipe
  ],
  templateUrl: './publisher-year-graph.component.html',
  styleUrl: './publisher-year-graph.component.scss'
})
export class PublisherYearGraphComponent {
  @Input() title: string;
  @Input() rows: number;
  @Output() closePanel = new EventEmitter();
  chartData = new BehaviorSubject<
    { name: string; series: { name: string; value: number }[] }[]
  >([]);
  private _data: ByPublisherAndYearSegment[];

  @Input() set data(segmentData: ByPublisherAndYearSegment[]) {
    const years = Array.from(
      new Set(segmentData.map(entry => entry.year))
    ).sort();
    this.chartData.next(
      years.map(year => {
        return {
          name: `${year}`,
          series: segmentData
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
