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
import {
  COMIC_BOOK_1,
  COMIC_BOOK_3,
  COMIC_BOOK_5
} from '@app/comic-books/comic-books.fixtures';

describe('ComicsByYearChartComponent', () => {
  const COMIC_BOOKS = [COMIC_BOOK_1, COMIC_BOOK_3, COMIC_BOOK_5];

  let component: ComicsByYearChartComponent;
  let fixture: ComponentFixture<ComicsByYearChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ComicsByYearChartComponent],
      imports: [LoggerModule.forRoot()]
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
      component.data = [];
      component.comicBooks = COMIC_BOOKS;
    });

    it('reloads the chart data', () => {
      expect(component.data).not.toEqual([]);
    });
  });
});
