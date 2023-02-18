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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ServerMetricsComponent } from './server-metrics.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ServerMetricDetailsComponent } from '@app/admin/components/server-metric-details/server-metric-details.component';
import {
  initialState as initialMetricsState,
  METRICS_FEATURE_KEY
} from '@app/admin/reducers/metrics.reducer';
import { METRIC_LIST } from '@app/admin/admin.fixtures';
import { loadMetricDetails } from '@app/admin/actions/metrics.actions';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('ServerMetricsComponent', () => {
  const initialState = { [METRICS_FEATURE_KEY]: initialMetricsState };

  let component: ServerMetricsComponent;
  let fixture: ComponentFixture<ServerMetricsComponent>;
  let store: MockStore<any>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ServerMetricsComponent, ServerMetricDetailsComponent],
      imports: [
        NoopAnimationsModule,
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule
      ],
      providers: [provideMockStore({ initialState })]
    }).compileComponents();

    fixture = TestBed.createComponent(ServerMetricsComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when a metric is selected', () => {
    const METRIC_NAME = METRIC_LIST.names[3];

    beforeEach(() => {
      component.onMetricNameSelected(METRIC_NAME);
    });

    it('retrieves the details', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        loadMetricDetails({ name: METRIC_NAME })
      );
    });
  });
});
