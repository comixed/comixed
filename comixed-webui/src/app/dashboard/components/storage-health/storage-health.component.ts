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

import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { AsyncPipe, JsonPipe } from '@angular/common';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardTitle
} from '@angular/material/card';
import { ServerHealth } from '@app/settings/models/server-health';
import { MatIcon } from '@angular/material/icon';
import { PieChartModule } from '@swimlane/ngx-charts';
import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { MatIconButton } from '@angular/material/button';

@Component({
  selector: 'cx-storage-health',
  imports: [
    JsonPipe,
    MatCard,
    MatCardContent,
    MatCardTitle,
    MatCardActions,
    MatIcon,
    AsyncPipe,
    PieChartModule,
    MatIconButton
  ],
  templateUrl: './storage-health.component.html',
  styleUrl: './storage-health.component.scss'
})
export class StorageHealthComponent {
  @Input() title: string;
  @Output() closePanel = new EventEmitter();

  translate = inject(TranslateService);
  chartData = new BehaviorSubject<{ name: string; value: number }[]>([]);

  @Input() set health(health: ServerHealth | null) {
    this.chartData.next([
      {
        name: this.translate.instant('dashboard.label.total-storage'),
        value: health?.components?.diskSpace?.details?.total || 0
      },
      {
        name: this.translate.instant('dashboard.label.available-storage'),
        value: health?.components?.diskSpace?.details?.free || 0
      }
    ]);
  }

  get chartOptions() {
    return {
      animations: null,
      plugins: { legend: { display: true } },
      responsive: true
    };
  }
}
