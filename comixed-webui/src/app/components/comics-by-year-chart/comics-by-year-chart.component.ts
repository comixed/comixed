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
  inject,
  Input,
  ViewChild
} from '@angular/core';
import {
  ComicsByYearData,
  TotalComicsForPublisher
} from '@app/models/ui/comics-by-year-data';
import { BehaviorSubject } from 'rxjs';
import { LoggerService } from '@angular-ru/cdk/logger';
import { LibraryState } from '@app/library/reducers/library.reducer';
import { yearsPerRow } from '@angular/material/datepicker';

@Component({
  selector: 'cx-comics-by-year-chart',
  templateUrl: './comics-by-year-chart.component.html',
  styleUrls: ['./comics-by-year-chart.component.scss'],
  standalone: false
})
export class ComicsByYearChartComponent implements AfterViewInit {
  @ViewChild('container') container: ElementRef;
  chartHeight$ = new BehaviorSubject<number>(0);
  chartWidth$ = new BehaviorSubject<number>(0);

  allData: ComicsByYearData[] = [];
  data$ = new BehaviorSubject<ComicsByYearData[]>([]);
  totalComicsForPublisher: TotalComicsForPublisher[] = [];
  yearOptions = [];
  publisherOptions = [];
  startYear = 0;
  endYear = 0;
  publishersToShow = 5;
  protected readonly yearsPerRow = yearsPerRow;

  logger = inject(LoggerService);

  @Input() set libraryState(libraryState: LibraryState) {
    this.logger.trace('Library state updated');
    const data = [];
    this.totalComicsForPublisher = libraryState.publishers
      .filter(entry => entry.name.length > 0)
      .map(entry => {
        return { name: entry.name, count: entry.count };
      });
    this.publisherOptions = [];
    libraryState.byPublisherAndYear.forEach(entry => {
      this.publisherOptions = this.publisherOptions.concat(entry.publisher);
      let record = data.find(existing => existing.name === entry.year);
      /* istanbul ignore else */
      if (!record) {
        this.logger.trace('Creating new record');
        record = {
          name: `${entry.year}`,
          series: []
        };
        data.push(record);
      }
      record.series.push({
        name: entry.publisher,
        value: entry.count
      });
    });
    this.data$.next(
      data.sort((left, right) =>
        left.name > right.name ? 1 : left.name < right.name ? -1 : 0
      )
    );
    this.allData = this.data$.value;
    this.yearOptions = libraryState.byPublisherAndYear
      .map(entry => entry.year)
      .filter((value, index, array) => index === array.indexOf(value))
      .sort();
    this.startYear = this.yearOptions.length > 0 ? this.yearOptions[0] : 0;
    this.endYear =
      this.yearOptions.length > 0
        ? this.yearOptions[this.yearOptions.length - 1]
        : 0;
    this.publisherOptions = this.publisherOptions.filter(
      (publisher, index, entries) => index === entries.indexOf(publisher)
    );
    this.publishersToShow = this.publisherOptions.length;
    this.doFilterData();
  }

  ngAfterViewInit(): void {
    this.loadComponentDimensions();
  }

  onShowData(
    startYear: number,
    endYear: number,
    publishersToShow: number
  ): void {
    if (startYear <= endYear) {
      this.startYear = startYear;
      this.endYear = endYear;
      this.publishersToShow = publishersToShow;
      this.doFilterData();
    }
  }

  private doFilterData(): void {
    /* istanbul ignore next */
    const publishersShown = this.totalComicsForPublisher
      .sort((left, right) => left.count - right.count)
      .reverse()
      .slice(0, this.publishersToShow)
      .map(entry => entry.name);
    /* istanbul ignore next */
    this.data$.next(
      this.allData
        .filter(entry => publishersShown.includes(entry.series[0].name))
        .filter(entry => parseInt(entry.name) >= this.startYear)
        .filter(entry => parseInt(entry.name) <= this.endYear)
        .sort(
          (left, right) =>
            this.totalComicsForPublisher.find(
              entry => entry.name === left.series[0].name
            ).count -
            this.totalComicsForPublisher.find(
              entry => entry.name === right.series[0].name
            ).count
        )
    );
  }

  private loadComponentDimensions(): void {
    /* istanbul ignore next */
    this.chartWidth$.next(this.container?.nativeElement?.offsetWidth);
    /* istanbul ignore next */
    let height = this.container?.nativeElement?.offsetHeight - 100;
    /* istanbul ignore if */
    if (height < 0) {
      height = 0;
    }
    this.chartHeight$.next(height - 65);
  }
}
