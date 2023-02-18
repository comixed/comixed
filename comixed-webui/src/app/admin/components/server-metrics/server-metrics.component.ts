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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import {
  selectMetricDetail,
  selectMetricList,
  selectMetricsState
} from '@app/admin/selectors/metrics.selectors';
import { setBusyState } from '@app/core/actions/busy.actions';
import { MetricList } from '@app/admin/models/metric-list';
import { MetricDetail } from '@app/admin/models/metric-detail';
import {
  loadMetricDetails,
  loadMetricList
} from '@app/admin/actions/metrics.actions';

@Component({
  selector: 'cx-health-metrics',
  templateUrl: './server-metrics.component.html',
  styleUrls: ['./server-metrics.component.scss']
})
export class ServerMetricsComponent implements OnInit, OnDestroy {
  metricStateSubscription: Subscription;
  metricListSubscription: Subscription;
  metricList: MetricList;
  metricDetailsSubscription: Subscription;
  metricDetail: MetricDetail;

  constructor(private logger: LoggerService, private store: Store<any>) {
    this.logger.trace('Subscribing to metric state updates');
    this.metricStateSubscription = this.store
      .select(selectMetricsState)
      .subscribe(state =>
        this.store.dispatch(setBusyState({ enabled: state.busy }))
      );
    this.logger.trace('Subscribing to metric list updates');
    this.metricListSubscription = this.store
      .select(selectMetricList)
      .subscribe(list => (this.metricList = list));
    this.logger.trace('Subscribing to metric detail updates');
    this.metricDetailsSubscription = this.store
      .select(selectMetricDetail)
      .subscribe(detail => (this.metricDetail = detail));
  }

  ngOnInit(): void {
    this.loadMetricList();
  }

  ngOnDestroy(): void {
    this.logger.trace('Unsubscribing from metric state updates');
    this.metricStateSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from metric list updates');
    this.metricListSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from metric detail updates');
    this.metricDetailsSubscription.unsubscribe();
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
