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
import { ComicStateChartComponent } from './comic-state-chart.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { initialState as initialLibraryState } from '@app/library/reducers/library.reducer';
import { ComicBookState } from '@app/comic-books/models/comic-book-state';

describe('ComicStateChartComponent', () => {
  const LIBRARY_STATE = {
    ...initialLibraryState,
    states: [
      { name: ComicBookState.ADDED, count: 0 },
      { name: ComicBookState.UNPROCESSED, count: 0 },
      { name: ComicBookState.STABLE, count: 0 },
      { name: ComicBookState.CHANGED, count: 0 },
      { name: ComicBookState.DELETED, count: 0 }
    ]
  };

  let component: ComicStateChartComponent;
  let fixture: ComponentFixture<ComicStateChartComponent>;
  let translateService: TranslateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ComicStateChartComponent],
      imports: [
        NoopAnimationsModule,
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        NgxChartsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicStateChartComponent);
    component = fixture.componentInstance;
    translateService = TestBed.inject(TranslateService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when comics are loaded', () => {
    beforeEach(() => {
      component.comicStateData = [];
      component.libraryState = LIBRARY_STATE;
    });

    it('loads the chart data', () => {});
  });

  describe('when the comics are set', () => {
    beforeEach(() => {
      component.comicStateData = [];
      component.libraryState = LIBRARY_STATE;
    });

    it('loads the statistics', () => {
      expect(component.comicStateData).not.toEqual([]);
    });
  });

  describe('when the language changes', () => {
    beforeEach(() => {
      component.libraryState = LIBRARY_STATE;
      component.comicStateData = [];
      translateService.use('fr');
    });

    it('loads the statistics', () => {
      expect(component.comicStateData).not.toEqual([]);
    });
  });

  describe('when the component size changes', () => {
    beforeEach(() => {
      component.chartWidth$.next(undefined);
      component.chartHeight$.next(undefined);
      component.onWindowResized({} as any);
    });

    it('sets the chart width', () => {
      expect(component.chartWidth$.value).not.toBeNull();
    });

    it('sets the chart height', () => {
      expect(component.chartHeight$.value).not.toBeNull();
    });
  });
});
