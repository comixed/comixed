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
import { Comic } from '@app/comic-books/models/comic';
import { LoggerService } from '@angular-ru/cdk/logger';
import { ChartData } from '@app/models/ui/chart-data';
import { ChartDataResultSet } from '@app/models/ui/chart-data-result-set';
import { BehaviorSubject } from 'rxjs';

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

  constructor(private logger: LoggerService) {}

  private _comics: Comic[];

  get comics(): Comic[] {
    return this._comics;
  }

  @Input() set comics(comics: Comic[]) {
    this._comics = comics;
    this.logger.trace('Loading library statistics by publisher');
    this.collectionData = [
      this.comicsByPublisher(),
      this.comicsBySeries(),
      this.comicsByCharacter(),
      this.comicsByTeam(),
      this.comicsByLocation(),
      this.comicsByStory()
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

  private loadComponentDimensions(): void {
    this.chartWidth$.next(this.container?.nativeElement?.offsetWidth);
    let height = this.container?.nativeElement?.offsetHeight - 125;
    if (height < 0) {
      height = 0;
    }
    this.chartHeight$.next(height);
  }

  private comicsByPublisher(): ChartData {
    const publishers = this.comics
      .map(comic => comic.publisher)
      .filter((publisher, index, self) => self.indexOf(publisher) === index);

    const results = this.limitResults(
      publishers.map(publisher => {
        return {
          name: publisher || 'UNKNOWN',
          value: this.comics.filter(entry => entry.publisher === publisher)
            .length
        };
      })
    );
    const sorted = results.map(result => result.value).reverse();
    const maxX = sorted.length > 0 ? sorted[0] : 0;
    return {
      title: 'publisher',
      results,
      maxX
    };
  }

  private comicsBySeries(): ChartData {
    const seriesNames = this.comics
      .map(comic => comic.series)
      .filter((entry, index, self) => self.indexOf(entry) === index);

    const results = this.limitResults(
      seriesNames.map(series => {
        return {
          name: series || 'UNKNOWN',
          value: this.comics.filter(entry => entry.series === series).length
        };
      })
    );
    const sorted = results.map(result => result.value).reverse();
    const maxX = sorted.length > 0 ? sorted[0] : 0;
    return {
      title: 'series',
      results,
      maxX
    };
  }

  private comicsByCharacter(): ChartData {
    const characters = [];
    this.comics.forEach(comic =>
      comic.characters.forEach(character => {
        if (!characters.includes(character)) {
          characters.push(character);
        }
      })
    );
    const results = this.limitResults(
      characters.map(character => {
        return {
          name: character,
          value: this.comics.filter(entry =>
            entry.characters.includes(character)
          ).length
        };
      })
    );
    const sorted = results.map(result => result.value).reverse();
    const maxX = sorted.length > 0 ? sorted[0] : 0;
    return {
      title: 'character',
      results,
      maxX
    };
  }

  private comicsByTeam(): ChartData {
    const teams = [];
    this.comics.forEach(comic =>
      comic.teams.forEach(team => {
        if (!teams.includes(team)) {
          teams.push(team);
        }
      })
    );
    const results = this.limitResults(
      teams.map(team => {
        return {
          name: team,
          value: this.comics.filter(entry => entry.teams.includes(team)).length
        };
      })
    );
    const sorted = results.map(result => result.value).reverse();
    const maxX = sorted.length > 0 ? sorted[0] : 0;
    return {
      title: 'team',
      results,
      maxX
    };
  }

  private comicsByLocation(): ChartData {
    const locations = [];
    this.comics.forEach(comic =>
      comic.locations.forEach(location => {
        if (!locations.includes(location)) {
          locations.push(location);
        }
      })
    );
    const results = this.limitResults(
      locations.map(location => {
        return {
          name: location,
          value: this.comics.filter(entry => entry.locations.includes(location))
            .length
        };
      })
    );
    const sorted = results.map(result => result.value).reverse();
    const maxX = sorted.length > 0 ? sorted[0] : 0;
    return {
      title: 'location',
      results,
      maxX
    };
  }

  private comicsByStory(): ChartData {
    const stories = [];
    this.comics.forEach(comic =>
      comic.stories.forEach(story => {
        if (!stories.includes(story)) {
          stories.push(story);
        }
      })
    );
    const results = this.limitResults(
      stories.map(story => {
        return {
          name: story,
          value: this.comics.filter(entry => entry.stories.includes(story))
            .length
        };
      })
    );
    const sorted = results.map(result => result.value).reverse();
    const maxX = sorted.length > 0 ? sorted[0] : 0;
    return {
      title: 'story',
      results,
      maxX
    };
  }

  private limitResults(results: ChartDataResultSet[]): ChartDataResultSet[] {
    const MAXIMUM_RESULTS = 10;
    const right =
      results.length > MAXIMUM_RESULTS ? MAXIMUM_RESULTS : results.length;
    return results.sort((a, b) => b.value - a.value).slice(0, right);
  }
}
