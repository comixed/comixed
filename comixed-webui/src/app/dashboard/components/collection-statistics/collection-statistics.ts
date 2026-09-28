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
import { TranslatePipe } from '@ngx-translate/core';
import { Card } from '@openng/optimus-ui/card';
import { Tooltip } from '@openng/optimus-ui/tooltip';
import { Button } from '@openng/optimus-ui/button';
import { RemoteLibrarySegment } from '@app/library/models/net/remote-library-segment';
import { GraphData } from '@app/dashboard/models/graph-data';
import { UIChart } from '@openng/optimus-ui/chart';
import { RouterLink } from '@angular/router';
import { BACKGROUND_COLORS } from '@app/dashboard/dashboard-constants';
import { topEntries } from '@app/dashboard/dashboard-functions';

@Component({
  imports: [TranslatePipe, Card, Tooltip, Button, UIChart, RouterLink],
  selector: 'app-collection-statistics',
  styleUrl: './collection-statistics.scss',
  templateUrl: './collection-statistics.html'
})
export class CollectionStatistics {
  @Output() zoom = new EventEmitter<void>();
  readonly chartTitle = signal('');
  readonly chartData = signal<GraphData>({ labels: [], datasets: [] });
  readonly chartUrl = signal('');
  readonly options = {
    responsive: true,
    maintainAspectRatio: false,
    animations: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        display: false,
        offset: true
      },
      y: {
        beginAtZero: true,
        offset: true,
        ticks: {
          beginAtZero: true,
          stepSize: 1
        }
      }
    }
  };

  @Input() set url(url: string) {
    this.chartUrl.set(url);
  }

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
    const source = topEntries(this.data, 5);
    const data = {
      labels: source.map(entry => entry.name),
      datasets: [
        {
          label: this.chartTitle(),
          data: source.map(entry => entry.count),
          backgroundColor: BACKGROUND_COLORS,
          borderWidth: 1
        }
      ]
    } as GraphData;

    this.chartData.set(data);
  }
}
