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
import { BehaviorSubject } from 'rxjs';
import { RemoteLibrarySegmentState } from '@app/library/models/net/remote-library-segment-state';
import { ArchiveType } from '@app/comic-books/models/archive-type.enum';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardTitle
} from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { PieChartModule } from '@swimlane/ngx-charts';
import { AsyncPipe } from '@angular/common';
import { MatIconButton } from '@angular/material/button';

@Component({
  selector: 'cx-archive-types',
  imports: [
    MatCard,
    MatCardActions,
    MatCardContent,
    MatCardTitle,
    MatIcon,
    PieChartModule,
    AsyncPipe,
    MatIconButton
  ],
  templateUrl: './archive-types.component.html',
  styleUrl: './archive-types.component.scss'
})
export class ArchiveTypesComponent {
  @Input() title: string;
  @Input() rows: number;

  labels = [ArchiveType.CBR, ArchiveType.CBZ, ArchiveType.CB7];
  chartData = new BehaviorSubject<{ name: string; value: number }[]>([]);

  @Output() closePanel = new EventEmitter();

  @Input() set data(segmentData: RemoteLibrarySegmentState[]) {
    this.chartData.next(
      segmentData.map(entry => {
        return {
          name: entry.name,
          value: entry.count
        };
      })
    );
  }

  get chartOptions() {
    return {
      animations: null,
      plugins: { legend: { display: true } },
      responsive: true
    };
  }
}
