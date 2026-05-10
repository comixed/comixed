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
import { AsyncPipe } from '@angular/common';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardTitle
} from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import {
  BarChartModule,
  NumberCardModule,
  PieChartModule
} from '@swimlane/ngx-charts';
import { BehaviorSubject } from 'rxjs';
import { MatIconButton } from '@angular/material/button';

@Component({
  selector: 'cx-library-stats',
  imports: [
    AsyncPipe,
    MatCard,
    MatCardActions,
    MatCardContent,
    MatCardTitle,
    MatIcon,
    PieChartModule,
    BarChartModule,
    NumberCardModule,
    MatIconButton
  ],
  templateUrl: './library-stat.component.html',
  styleUrl: './library-stat.component.scss'
})
export class LibraryStatComponent {
  @Input() title: string;
  @Output() closePanel = new EventEmitter();
  chartData = new BehaviorSubject<{ name: string; value: number }[]>([]);

  @Input() set data(statistics: { name: string; value: number }[]) {
    this.chartData.next(statistics);
  }
}
