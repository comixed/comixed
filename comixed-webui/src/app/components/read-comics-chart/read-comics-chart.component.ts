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

import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  ViewChild
} from '@angular/core';
import { LastRead } from '@app/comic-books/models/last-read';
import { BehaviorSubject } from 'rxjs';
import { LoggerService } from '@angular-ru/cdk/logger';
import { LibraryState } from '@app/library/reducers/library.reducer';

interface LastReadEntry {
  name: string;
  value: number;
}

@Component({
  selector: 'cx-read-comics-chart',
  templateUrl: './read-comics-chart.component.html',
  styleUrls: ['./read-comics-chart.component.scss']
})
export class ReadComicsChartComponent implements AfterViewInit {
  @ViewChild('container') container: ElementRef;

  chartHeight$ = new BehaviorSubject<number>(0);
  chartWidth$ = new BehaviorSubject<number>(0);
  lastReadComicBooksData: LastReadEntry[] = [];

  constructor(private logger: LoggerService) {}

  private _libraryState: LibraryState;

  get libraryState(): LibraryState {
    return this._libraryState;
  }

  @Input() set libraryState(libraryState: LibraryState) {
    this._libraryState = libraryState;
    this.loadReadComicBooksData();
  }

  private _lastRead: LastRead[] = [];

  get lastRead(): LastRead[] {
    return this._lastRead;
  }

  @Input() set lastRead(lastRead: LastRead[]) {
    this.logger.trace('Last read entries updated:', lastRead);
    this._lastRead = lastRead || [];
    this.loadReadComicBooksData();
  }

  ngAfterViewInit(): void {
    this.loadComponentDimensions();
  }

  private loadReadComicBooksData(): void {
    if (!this.libraryState) {
      this.logger.debug('No library state loaded');
      alert('No library state loaded');
      return;
    }
    this.lastReadComicBooksData = this.libraryState.publishers
      .map(publisher => publisher.name)
      .map(publisher => {
        return {
          name: publisher,
          value: this.lastRead.filter(
            entry => entry.comicDetail.publisher === publisher
          ).length
        };
      })
      .sort((left, right) => right.value - left.value);
  }

  private loadComponentDimensions(): void {
    /* istanbul ignore next */
    this.chartWidth$.next(this.container?.nativeElement?.offsetWidth);
    /* istanbul ignore next */
    let height = this.container?.nativeElement?.offsetHeight;
    /* istanbul ignore if */
    if (height < 0) {
      height = 0;
    }
    this.chartHeight$.next(height);
  }
}
