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

interface DataSetEntry {
  label: string;
  data: number[];
  backgroundColor: string[];
  borderColor: string[];
  borderWidth: number;
}

interface GraphData {
  labels: string[];
  datasets: DataSetEntry[];
}

@Component({
  imports: [Card, UIChart, Button],
  selector: 'app-collection-graph-widget',
  styleUrl: './collection-graph-widget.scss',
  templateUrl: './collection-graph-widget.html'
})
export class CollectionGraphWidget {
  readonly data = signal<GraphData>({} as GraphData);
  readonly dataTitle = signal('');
  readonly maxRecords = signal(0);

  @Output() unzoom = new EventEmitter<void>();

  private _segment: RemoteLibrarySegment[] = [];

  get segment(): RemoteLibrarySegment[] {
    return this._segment;
  }

  @Input() set segment(segment: RemoteLibrarySegment[]) {
    this._segment = Array.from(segment);
    this.doLoadData();
  }

  @Input() set records(records: number) {
    this.maxRecords.set(records);
    this.doLoadData();
  }

  @Input() set title(title: string) {
    this.dataTitle.set(title);
    this.doLoadData();
  }

  private doLoadData() {
    const source = this.segment
      .sort((left, right) =>
        this.maxRecords() === 0 ? 0 : left.count - right.count
      )
      .reverse()
      .slice(
        0,
        this.maxRecords() === 0 ? this.segment.length : this.maxRecords()
      );
    const data = {
      labels: source.map(entry => entry.name),
      datasets: [
        {
          label: this.dataTitle(),
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

    this.data.set(data);
  }
}
