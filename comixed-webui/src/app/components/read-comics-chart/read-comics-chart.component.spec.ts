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
  COMIC_BOOK_1,
  COMIC_BOOK_3,
  COMIC_BOOK_5
} from '@app/comic-books/comic-books.fixtures';
import { LAST_READ_1, LAST_READ_3 } from '@app/last-read/last-read.fixtures';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('ReadComicsChartComponent', () => {
  const COMIC_BOOKS = [COMIC_BOOK_1, COMIC_BOOK_3, COMIC_BOOK_5];
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

  describe('when comic books are loaded', () => {
    beforeEach(() => {
      component.lastReadComicBooksData = [];
      component.comicBooks = COMIC_BOOKS;
    });

    it('loads the last read data', () => {
      expect(component.lastReadComicBooksData).not.toEqual([]);
    });

    describe('when last read entries are loaded', () => {
      beforeEach(() => {
        component.lastReadComicBooksData = [];
        component.lastRead = LAST_READS;
      });

      it('loads the last read data', () => {
        expect(component.lastReadComicBooksData).not.toEqual([]);
      });
    });
  });
});
