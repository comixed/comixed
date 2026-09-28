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

import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { RemoteLibrarySegment } from '@app/library/models/net/remote-library-segment';
import { Card } from '@openng/optimus-ui/card';
import { UIChart } from '@openng/optimus-ui/chart';
import { Button } from '@openng/optimus-ui/button';
import { GraphData } from '@app/dashboard/models/graph-data';
import { BACKGROUND_COLORS } from '@app/dashboard/dashboard-constants';
import { topEntries } from '@app/dashboard/dashboard-functions';

@Component({
  imports: [Card, UIChart, Button],
  selector: 'app-zoomed-statistics',
  styleUrl: './zoomed-statistics.scss',
  templateUrl: './zoomed-statistics.html'
})
export class ZoomedStatistics {
  readonly data = signal<GraphData>({} as GraphData);
  readonly dataTitle = signal('');
  readonly options = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          beginAtZero: true,
          stepSize: 1
        }
      }
    }
  };

  @Output() unzoom = new EventEmitter<void>();

  private _segment: RemoteLibrarySegment[] = [];

  get segment(): RemoteLibrarySegment[] {
    return this._segment;
  }

  @Input() set segment(segment: RemoteLibrarySegment[]) {
    this._segment = Array.from(segment);
    this.doLoadData();
  }

  @Input() set title(title: string) {
    this.dataTitle.set(title);
    this.doLoadData();
  }

  private doLoadData() {
    const source = topEntries(this.segment, 50);
    const data = {
      labels: source.map(entry => entry.name),
      datasets: [
        {
          label: this.dataTitle(),
          data: source.map(entry => entry.count),
          backgroundColor: BACKGROUND_COLORS,
          borderWidth: 1
        }
      ]
    } as GraphData;

    this.data.set(data);
  }
}
