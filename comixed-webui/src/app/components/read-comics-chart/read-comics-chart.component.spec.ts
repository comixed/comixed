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
import { ReadComicsChartComponent } from './read-comics-chart.component';
import {
  LAST_READ_1,
  LAST_READ_3
} from '@app/comic-books/comic-books.fixtures';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { initialState as initialLibraryState } from '@app/library/reducers/library.reducer';

describe('ReadComicsChartComponent', () => {
  const LIBRARY_STATE = {
    ...initialLibraryState,
    publishers: [
      { name: 'Publisher 1', count: 17 },
      { name: 'Publisher 2', count: 3 }
    ]
  };
  const LAST_READS = [LAST_READ_1, LAST_READ_3];

  let component: ReadComicsChartComponent;
  let fixture: ComponentFixture<ReadComicsChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReadComicsChartComponent],
      imports: [
        NoopAnimationsModule,
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        NgxChartsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReadComicsChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('updating the last read data', () => {
    describe('when not yet loaded', () => {
      beforeEach(() => {
        component.lastRead = null;
      });

      it('sets an empty array', () => {
        expect(component.lastRead).toEqual([]);
      });
    });

    describe('when loaded', () => {
      beforeEach(() => {
        component.lastRead = LAST_READS;
      });

      it('sets an empty array', () => {
        expect(component.lastRead).toEqual(LAST_READS);
      });
    });
  });

  describe('updating the chart data', () => {
    beforeEach(() => {
      component.lastReadComicBooksData = [];
      component.libraryState = null;
      component.lastRead = LAST_READS;
    });

    it('does not update the data', () => {
      expect(component.lastReadComicBooksData).toEqual([]);
    });

    describe('when the library data is loaded', () => {
      beforeEach(() => {
        component.libraryState = LIBRARY_STATE;
      });

      it('loads the last read data', () => {
        expect(component.lastReadComicBooksData).not.toEqual([]);
      });
    });
  });
});
