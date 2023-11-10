/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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
import { ComicsReadChartComponent } from './comics-read-chart.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  COMICS_READ_STATISTICS_1,
  COMICS_READ_STATISTICS_2,
  COMICS_READ_STATISTICS_3,
  COMICS_READ_STATISTICS_4,
  COMICS_READ_STATISTICS_5
} from '@app/app.fixtures';
import {
  COMICS_READ_STATISTICS_FEATURE_KEY,
  initialState as initialComicsReadStatisticsState
} from '@app/reducers/comics-read-statistics.reducer';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

describe('ComicsReadChartComponent', () => {
  const DATA = [
    COMICS_READ_STATISTICS_1,
    COMICS_READ_STATISTICS_2,
    COMICS_READ_STATISTICS_3,
    COMICS_READ_STATISTICS_4,
    COMICS_READ_STATISTICS_5
  ];
  const initialState = {
    [COMICS_READ_STATISTICS_FEATURE_KEY]: initialComicsReadStatisticsState
  };

  let component: ComicsReadChartComponent;
  let fixture: ComponentFixture<ComicsReadChartComponent>;
  let store: MockStore<any>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ComicsReadChartComponent],
      imports: [
        NoopAnimationsModule,
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        NgxChartsModule
      ],
      providers: [provideMockStore({ initialState })]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicsReadChartComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('loading comics read statistics', () => {
    beforeEach(() => {
      component.comicsReadStatistics = [];
      store.setState({
        ...initialState,
        [COMICS_READ_STATISTICS_FEATURE_KEY]: { ...initialState, data: DATA }
      });
    });

    it('loads the statistics', () => {
      expect(component.comicsReadStatistics).not.toEqual([]);
    });
  });
});
