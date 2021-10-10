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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LoggerService } from '@angular-ru/logger';
import { Subscription } from 'rxjs';
import { TitleService } from '@app/core/services/title.service';
import { selectServerStatusState } from '@app/selectors/server-status.selectors';
import { Store } from '@ngrx/store';
import { Comic } from '@app/comic-books/models/comic';
import { ChartData } from '@app/models/ui/chart-data';
import { selectComicListState } from '@app/comic-books/selectors/comic-list.selectors';
import { ChartDataResultSet } from '@app/models/ui/chart-data-result-set';

@Component({
  selector: 'cx-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  langChangeSubscription: Subscription;
  serverStateSubscription: Subscription;
  comicStateSubscription: Subscription;
  loading = false;

  taskCount = 0;
  charts: ChartData[] = [];
  chart: ChartData;

  constructor(
    private logger: LoggerService,
    private titleService: TitleService,
    private translateService: TranslateService,
    private store: Store<any>
  ) {
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.serverStateSubscription = this.store
      .select(selectServerStatusState)
      .subscribe(state => {
        this.taskCount = state.taskCount;
      });
    this.comicStateSubscription = this.store
      .select(selectComicListState)
      .subscribe(state => {
        this.loading = state.loading;
        // don't process comics till we've finished loading
        if (!state.loading && state.lastPayload) {
          this.comics = state.comics;
        }
      });
  }

  set comics(comics: Comic[]) {
    this.logger.trace('Loading library statistics by publisher');
    this.charts = [
      this.comicsByPublisher(comics),
      this.comicsBySeries(comics),
      this.comicsByCharacter(comics),
      this.comicsByTeam(comics),
      this.comicsByLocation(comics),
      this.comicsByStory(comics)
    ];
    this.chart = this.charts[0];
  }

  ngOnInit(): void {
    this.loadTranslations();
  }

  ngOnDestroy(): void {
    this.logger.trace('Unsubscribing from language changes');
    this.langChangeSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from server state changes');
    this.serverStateSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from comic updates');
    this.comicStateSubscription.unsubscribe();
  }

  onShowChart(chart: ChartData): void {
    this.logger.trace('Changing chart');
    this.chart = chart;
  }

  private comicsByPublisher(comics: Comic[]): ChartData {
    const publishers = comics
      .map(comic => comic.publisher)
      .filter((publisher, index, self) => self.indexOf(publisher) === index);

    const results = this.limitResults(
      publishers.map(publisher => {
        return {
          name: publisher || 'UNKNOWN',
          value: comics.filter(entry => entry.publisher === publisher).length
        };
      })
    );
    return {
      title: 'publisher',
      results
    };
  }

  private comicsBySeries(comics: Comic[]): ChartData {
    const seriesNames = comics
      .map(comic => comic.series)
      .filter((entry, index, self) => self.indexOf(entry) === index);

    const results = this.limitResults(
        seriesNames.map(series => {
        return {
          name: series || 'UNKNOWN',
          value: comics.filter(entry => entry.series === series).length
        };
      })
    );
    return {
      title: 'series',
      results
    };
  }

  private loadTranslations(): void {
    this.logger.trace('Loading translations');
    this.titleService.setTitle(this.translateService.instant('home.tab-title'));
  }

  private comicsByCharacter(comics: Comic[]): ChartData {
    const characters = [];
    comics.forEach(comic =>
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
          value: comics.filter(entry => entry.characters.includes(character))
            .length
        };
      })
    );
    return {
      title: 'character',
      results
    };
  }

  private comicsByTeam(comics: Comic[]): ChartData {
    const teams = [];
    comics.forEach(comic =>
      comic.characters.forEach(team => {
        if (!teams.includes(team)) {
          teams.push(team);
        }
      })
    );
    const results = this.limitResults(
      teams.map(team => {
        return {
          name: team,
          value: comics.filter(entry => entry.teams.includes(team)).length
        };
      })
    );
    return {
      title: 'team',
      results
    };
  }

  private comicsByLocation(comics: Comic[]): ChartData {
    const locations = [];
    comics.forEach(comic =>
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
          value: comics.filter(entry => entry.locations.includes(location))
            .length
        };
      })
    );
    return {
      title: 'location',
      results
    };
  }

  private comicsByStory(comics: Comic[]): ChartData {
    const stories = [];
    comics.forEach(comic =>
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
          value: comics.filter(entry => entry.stories.includes(story)).length
        };
      })
    );
    return {
      title: 'story',
      results
    };
  }

  private limitResults(results: ChartDataResultSet[]): ChartDataResultSet[] {
    const MAXIMUM_RESULTS = 10;
    const right =
      results.length > MAXIMUM_RESULTS ? MAXIMUM_RESULTS : results.length;
    return results.sort((a, b) => b.value - a.value).slice(0, right);
  }
}
