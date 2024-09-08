/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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
import { ComicsByYearChartComponent } from './comics-by-year-chart.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { initialState as initialLibraryState } from '@app/library/reducers/library.reducer';
import { TranslateModule } from '@ngx-translate/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

describe('ComicsByYearChartComponent', () => {
  const LIBRARY_STATE = {
    ...initialLibraryState,
    publishers: [
      { name: 'Publisher 1', count: 10 },
      { name: 'Publisher 2', count: 100 }
    ],
    byPublisherAndYear: [
      { publisher: 'Publisher 1', year: 2017, count: 23 },
      { publisher: 'Publisher 1', year: 2018, count: 27 },
      { publisher: 'Publisher 2', year: 2017, count: 11 }
    ]
  };

  let component: ComicsByYearChartComponent;
  let fixture: ComponentFixture<ComicsByYearChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ComicsByYearChartComponent],
      imports: [
        NoopAnimationsModule,
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        NgxChartsModule,
        MatFormFieldModule,
        MatSelectModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicsByYearChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('loading comics', () => {
    beforeEach(() => {
      component.data$.next([]);
      component.allData = [];
      component.totalComicsForPublisher = [];
      component.libraryState = LIBRARY_STATE;
    });

    it('reloads the chart data', () => {
      expect(component.allData).not.toEqual([]);
    });

    it('loads the comic count per publisher', () => {
      expect(component.totalComicsForPublisher).not.toEqual([]);
    });
  });

  describe('showing data', () => {
    const START_YEAR = 1965;
    const END_YEAR = 2024;
    const PUBLISHERS_TO_SHOW = 15;

    beforeEach(() => {
      component.startYear = component.endYear = component.publishersToShow = 0;
      component.onShowData(START_YEAR, END_YEAR, PUBLISHERS_TO_SHOW);
    });

    it('updates the start year', () => {
      expect(component.startYear).toEqual(START_YEAR);
    });

    it('updates the end year', () => {
      expect(component.endYear).toEqual(END_YEAR);
    });

    it('updates the publishers to show', () => {
      expect(component.publishersToShow).toEqual(PUBLISHERS_TO_SHOW);
    });
  });
});
