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
import { Card } from '@openng/optimus-ui/card';
import { UIChart } from '@openng/optimus-ui/chart';
import { BACKGROUND_COLORS } from '@app/dashboard/dashboard-constants';

interface PieData {
  labels: string[];
  datasets: [{ data: number[]; backgroundColor: string[] }];
}

@Component({
  imports: [Card, UIChart],
  selector: 'app-distribution-statistics',
  styleUrl: './distribution-statistics.scss',
  templateUrl: './distribution-statistics.html'
})
export class DistributionStatistics {
  readonly chartTitle = signal('');
  readonly chartData = signal({
    labels: [''],
    datasets: [{ data: [1] }]
  } as PieData);
  readonly options = {
    responsive: true,
    maintainAspectRatio: false,
    animations: false
  };

  @Input() set title(title: string) {
    this.chartTitle.set(title);
    this.doLoadData();
  }

  private _data: RemoteLibrarySegment[] = [];

  get data(): RemoteLibrarySegment[] {
    return this._data;
  }

  @Input() set data(data: RemoteLibrarySegment[]) {
    this._data = data;
    this.doLoadData();
  }

  private doLoadData() {
    this.chartData.set({
      labels: this.data.map(entry => entry.name),
      datasets: [
        {
          data: this.data.map(entry => entry.count),
          backgroundColor: BACKGROUND_COLORS
        }
      ]
    } as PieData);
  }
}
