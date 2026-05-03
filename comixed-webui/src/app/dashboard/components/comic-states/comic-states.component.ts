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
import { RemoteLibrarySegmentState } from '@app/library/models/net/remote-library-segment-state';
import { TranslateModule } from '@ngx-translate/core';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardTitle
} from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { ComicState } from '@app/comic-books/models/comic-state';
import { BehaviorSubject } from 'rxjs';
import { BarChartModule } from '@swimlane/ngx-charts';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'cx-comic-states',
  imports: [
    TranslateModule,
    MatCard,
    MatCardActions,
    MatCardContent,
    MatCardTitle,
    MatIcon,
    BarChartModule,
    AsyncPipe
  ],
  templateUrl: './comic-states.component.html',
  styleUrl: './comic-states.component.scss'
})
export class ComicStatesComponent {
  @Input() title: string;
  @Input() rows: number;

  labels = [
    ComicState.ADDED,
    ComicState.DISCOVERED,
    ComicState.UNPROCESSED,
    ComicState.STABLE,
    ComicState.CHANGED,
    ComicState.DELETED
  ];
  chartData = new BehaviorSubject<{ name: string; value: number }[]>([]);

  @Output() closePanel = new EventEmitter();

  @Input() set data(segmentData: RemoteLibrarySegmentState[]) {
    this.chartData.next(
      this.labels.map(label => {
        const data = segmentData.find(entry => entry.name === label);
        return {
          name: label,
          value: data?.count || 0
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
