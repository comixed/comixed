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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PublisherYearGraphComponent } from './publisher-year-graph.component';

describe('PublisherYearGraphComponent', () => {
  const PUBLISHER = 'the.publisher-name';
  const YEAR = new Date().getFullYear();
  const COUNT = Math.abs(Math.round(Math.random() * 1000));

  let component: PublisherYearGraphComponent;
  let fixture: ComponentFixture<PublisherYearGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublisherYearGraphComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PublisherYearGraphComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('provides chart options', () => {
    expect(component.chartOptions).not.toBeNull();
  });

  describe('updating the data', () => {
    beforeEach(() => {
      component.data = [{ publisher: PUBLISHER, year: YEAR, count: COUNT }];
    });

    it('updates the chart data', () => {
      expect(component.chartData.value[0].name).toEqual(`${YEAR}`);
      expect(component.chartData.value[0].series[0].name).toEqual(PUBLISHER);
      expect(component.chartData.value[0].series[0].value).toEqual(COUNT);
    });
  });
});
