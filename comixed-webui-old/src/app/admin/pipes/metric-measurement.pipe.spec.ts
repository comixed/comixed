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

import { MetricMeasurementPipe } from './metric-measurement.pipe';
import { METRIC_DETAIL } from '@app/admin/admin.fixtures';

describe('MetricMeasurementPipe', () => {
  let pipe: MetricMeasurementPipe;

  beforeEach(() => {
    pipe = new MetricMeasurementPipe();
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  it('generates the metric text', () => {
    METRIC_DETAIL.measurements.forEach(measurement => {
      expect(
        pipe.transform(METRIC_DETAIL, measurement.statistic).length
      ).not.toBe(0);
    });
  });

  it('generates no text for an unknown metric', () => {
    expect(pipe.transform(METRIC_DETAIL, 'farkle')).toBeNull();
  });
});
