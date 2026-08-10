/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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

import { Component, inject, OnInit } from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import {
  selectMetricDetail,
  selectMetricList,
  selectMetricsBusy
} from '@app/admin/selectors/metrics.selectors';
import { setBusyState } from '@app/core/actions/busy.actions';
import { MetricList } from '@app/admin/models/metric-list';
import { MetricDetail } from '@app/admin/models/metric-detail';
import {
  loadMetricDetails,
  loadMetricList
} from '@app/admin/actions/metrics.actions';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatInput } from '@angular/material/input';
import { ServerMetricDetailsComponent } from '../server-metric-details/server-metric-details.component';
import { TranslateModule } from '@ngx-translate/core';
import { tap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'cx-health-metrics',
  templateUrl: './server-metrics.component.html',
  styleUrls: ['./server-metrics.component.scss'],
  imports: [
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatInput,
    ServerMetricDetailsComponent,
    TranslateModule,
    AsyncPipe
  ]
})
export class ServerMetricsComponent implements OnInit {
  metricList$ = new BehaviorSubject<MetricList | null>(null);
  metricDetail$ = new BehaviorSubject<MetricDetail | null>(null);

  logger = inject(LoggerService);
  store = inject(Store);

  constructor() {
    this.store
      .select(selectMetricsBusy)
      .pipe(tap(enabled => this.store.dispatch(setBusyState({ enabled }))))
      .subscribe();
    this.store
      .select(selectMetricList)
      .pipe(tap(list => this.metricList$.next(list)))
      .subscribe();
    this.store
      .select(selectMetricDetail)
      .pipe(tap(detail => this.metricDetail$.next(detail)))
      .subscribe();
  }

  ngOnInit(): void {
    this.loadMetricList();
  }

  onMetricNameSelected(name: string): void {
    this.logger.debug('Loading metric details for:', name);
    this.store.dispatch(loadMetricDetails({ name }));
  }

  private loadMetricList(): void {
    this.logger.trace('Loadinging the metric list');
    this.store.dispatch(loadMetricList());
  }
}
