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
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import { selectComicsReadStatisticsData } from '@app/selectors/comics-read-statistics.selectors';
import { loadComicsReadStatistics } from '@app/actions/comics-read-statistics.actions';

@Component({
  selector: 'cx-comics-read-chart',
  templateUrl: './comics-read-chart.component.html',
  styleUrls: ['./comics-read-chart.component.scss']
})
export class ComicsReadChartComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @ViewChild('container') container: ElementRef;

  comicsReadStatisticsStateSubscription: Subscription;
  comicsReadStatisticsDataSubscription: Subscription;
  comicsReadStatistics: { name: string; value: number }[] = [];

  chartHeight$ = new BehaviorSubject<number>(0);
  chartWidth$ = new BehaviorSubject<number>(0);

  constructor(private logger: LoggerService, private store: Store) {
    this.logger.debug('Subscribing to comics read statistics updates');
    this.comicsReadStatisticsDataSubscription = this.store
      .select(selectComicsReadStatisticsData)
      .subscribe(
        data =>
          (this.comicsReadStatistics = data.map(entry => {
            return { name: entry.publisher, value: entry.count };
          }))
      );
  }

  ngOnDestroy(): void {
    this.logger.debug('Unsubscribing from comics read statistics updates');
    this.comicsReadStatisticsDataSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.logger.debug('Loading comics read statistics');
    this.store.dispatch(loadComicsReadStatistics());
  }

  ngAfterViewInit(): void {
    this.loadComponentDimensions();
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
