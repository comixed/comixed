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
  HostListener,
  Input,
  ViewChild
} from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { ChartData } from '@app/models/ui/chart-data';
import { ChartDataResultSet } from '@app/models/ui/chart-data-result-set';
import { BehaviorSubject } from 'rxjs';
import { tagTypeFromString } from '@app/collections/models/comic-collection.enum';
import { Router } from '@angular/router';
import { LibraryState } from '@app/library/reducers/library.reducer';
import { RemoteLibrarySegmentState } from '@app/library/models/net/remote-library-segment-state';
import * as _ from 'lodash';

@Component({
  selector: 'cx-collections-chart',
  templateUrl: './collections-chart.component.html',
  styleUrls: ['./collections-chart.component.scss']
})
export class CollectionsChartComponent implements AfterViewInit {
  @ViewChild('container') container: ElementRef;

  collectionData: ChartData[] = [];
  currentCollection = 0;
  chartHeight$ = new BehaviorSubject<number>(0);
  chartWidth$ = new BehaviorSubject<number>(0);

  constructor(private logger: LoggerService, private router: Router) {}

  private _libraryState: LibraryState = null;

  get libraryState(): LibraryState {
    return this._libraryState;
  }

  @Input()
  set libraryState(libraryState: LibraryState) {
    this._libraryState = libraryState;
    this.collectionData = [
      this.createChartData('publisher', libraryState.publishers),
      this.createChartData('series', libraryState.series),
      this.createChartData('character', libraryState.characters),
      this.createChartData('team', libraryState.teams),
      this.createChartData('location', libraryState.locations),
      this.createChartData('story', libraryState.stories)
    ];
  }

  @HostListener('window:resize', ['$event'])
  onWindowResized(_event: any): void {
    this.loadComponentDimensions();
  }

  ngAfterViewInit(): void {
    this.loadComponentDimensions();
  }

  onSwitchCollection(collection: number): void {
    this.logger.trace('Changing collection');
    this.currentCollection = collection;
  }

  onCollectionSelected(collection: string, name: string): void {
    this.logger.info('Forwarding to collection list:', collection);
    this.router.navigate([
      'library',
      'collections',
      tagTypeFromString(collection),
      name || '[UNKNOWN]'
    ]);
  }

  private createChartData(
    title: string,
    segment: RemoteLibrarySegmentState[]
  ): ChartData {
    const sorted = _.cloneDeep(segment).sort(
      (left, right) => right.count - left.count
    );
    const results = this.limitResults(
      sorted.map(entry => {
        return { name: entry.name, value: entry.count } as ChartDataResultSet;
      })
    );
    return {
      title,
      results,
      maxX: sorted.length > 0 ? sorted[0].count : 0
    };
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

  private limitResults(results: ChartDataResultSet[]): ChartDataResultSet[] {
    const MAXIMUM_RESULTS = 10;
    /* istanbul ignore next */
    const right =
      results.length > MAXIMUM_RESULTS ? MAXIMUM_RESULTS : results.length;
    return results.sort((a, b) => b.value - a.value).slice(0, right);
  }
}
