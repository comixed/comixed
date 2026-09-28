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

import { createAction, props } from '@ngrx/store';
import { MetricList } from '@app/admin/models/metric-list';
import { MetricDetail } from '@app/admin/models/metric-detail';

export const loadMetricList = createAction('[Metrics] Load server metric list');

export const metricListLoaded = createAction(
  '[Metrics] Server metric list loaded',
  props<{ list: MetricList }>()
);

export const loadMetricListFailed = createAction(
  '[Metrics] Failed to load server metrics'
);

export const loadMetricDetails = createAction(
  '[Metrics] Load the details for a single metric',
  props<{ name: string }>()
);

export const metricDetailsLoaded = createAction(
  '[Metrics] Loaded the details for a single metric',
  props<{ detail: MetricDetail }>()
);

export const loadMetricDetailsFailed = createAction(
  '[Metrics] Failed to load the details for a single metrics'
);
