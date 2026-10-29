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
    scales: {
      x: {
        display: false
      },
      y: {
        beginAtZero: true
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
    const source = Array.from(this.data)
      .sort((left, right) => left.count - right.count)
      .reverse()
      .slice(0, 5);
    const data = {
      labels: source.map(entry => entry.name),
      datasets: [
        {
          label: this.chartTitle(),
          data: source.map(entry => entry.count),
          backgroundColor: [
            'rgba(249, 115, 22, 0.2)',
            'rgba(6, 182, 212, 0.2)',
            'rgb(107, 114, 128, 0.2)',
            'rgba(139, 92, 246, 0.2)'
          ],
          borderColor: [
            'rgb(249, 115, 22)',
            'rgb(6, 182, 212)',
            'rgb(107, 114, 128)',
            'rgb(139, 92, 246)'
          ],
          borderWidth: 1
        }
      ]
    } as GraphData;

    this.chartData.set(data);
  }
}
