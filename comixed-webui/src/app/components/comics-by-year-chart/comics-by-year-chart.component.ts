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

import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  ViewChild
} from '@angular/core';
import { ComicBook } from '@app/comic-books/models/comic-book';
import { ComicsByYearData } from '@app/models/ui/comics-by-year-data';
import { BehaviorSubject } from 'rxjs';
import { LoggerService } from '@angular-ru/cdk/logger';

@Component({
  selector: 'cx-comics-by-year-chart',
  templateUrl: './comics-by-year-chart.component.html',
  styleUrls: ['./comics-by-year-chart.component.scss']
})
export class ComicsByYearChartComponent implements AfterViewInit {
  @ViewChild('container') container: ElementRef;
  chartHeight$ = new BehaviorSubject<number>(0);
  chartWidth$ = new BehaviorSubject<number>(0);

  data: ComicsByYearData[] = [];

  constructor(private logger: LoggerService) {}

  @Input() set comicBooks(comicBooks: ComicBook[]) {
    const transformed: ComicsByYearData[] = [];
    this.logger.trace('Reloading comics by publisher and year data');
    comicBooks
      .filter(comicBook => !!comicBook.coverDate)
      .map(comicBook => {
        const coverDate = new Date(comicBook.coverDate);
        return {
          publisher: comicBook.publisher,
          year: `${coverDate.getFullYear()}`,
          comicBook
        };
      })
      .sort(
        (left, right) => left.comicBook.coverDate - right.comicBook.coverDate
      )
      .forEach(entry => {
        let publisher = transformed.find(record => record.name === entry.year);
        if (!publisher) {
          publisher = {
            name: entry.year,
            series: []
          } as ComicsByYearData;
          transformed.push(publisher);
        }
        let series = publisher.series.find(
          record => record.name === entry.publisher
        );
        if (!!series) {
          series.value += 1;
        } else {
          series = {
            name: entry.publisher,
            value: 1
          };
          publisher.series.push(series);
        }
      });
    this.data = transformed;
  }

  ngAfterViewInit(): void {
    this.loadComponentDimensions();
  }

  private loadComponentDimensions(): void {
    this.chartWidth$.next(this.container?.nativeElement?.offsetWidth);
    let height = this.container?.nativeElement?.offsetHeight - 100;
    if (height < 0) {
      height = 0;
    }
    this.chartHeight$.next(height);
  }
}
