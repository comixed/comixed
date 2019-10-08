/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project
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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { AppState } from 'app/app.state';
import { SelectItem } from 'primeng/api';
import { LibraryAdaptor } from 'app/library';
import { ComicCollectionEntry } from 'app/library';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { BreadcrumbAdaptor } from 'app/adaptors/breadcrumb.adaptor';

const COLOR_PALLETTE = [
  '#C0C0C0',
  '#808080',
  '#000000',
  '#FF0000',
  '#800000',
  '#FFFF00',
  '#808000',
  '#00FF00',
  '#008000',
  '#00FFFF',
  '#008080',
  '#0000FF',
  '#000080',
  '#FF00FF',
  '#800080'
];

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit, OnDestroy {
  comics_subscription: Subscription;
  publishers_subscription: Subscription;
  publishers: ComicCollectionEntry[];
  series_subscription: Subscription;
  series: ComicCollectionEntry[];
  characters_subscription: Subscription;
  characters: ComicCollectionEntry[];
  teams_subscription: Subscription;
  teams: ComicCollectionEntry[];
  locations_subscription: Subscription;
  locations: ComicCollectionEntry[];
  comic_count: number;
  plural = false;

  public library_data: any;
  public options: any;
  public data_options: Array<SelectItem> = [
    { label: 'Publishers', value: 'publishers' },
    { label: 'Series', value: 'series' },
    { label: 'Characters', value: 'characters' },
    { label: 'Teams', value: 'teams' },
    { label: 'Locations', value: 'locations' }
  ];
  public data_to_show = 'publishers';

  constructor(
    private titleService: Title,
    private translateService: TranslateService,
    private libraryAdaptor: LibraryAdaptor,
    private breadcrumbAdaptor: BreadcrumbAdaptor
  ) {
    this.options = {
      title: {
        display: true,
        text: '',
        fontSize: 16
      },
      legend: {
        position: 'bottom'
      }
    };
  }

  ngOnInit() {
    this.translateService.onLangChange.subscribe(() => {
      this.titleService.setTitle(
        this.translateService.instant('main-page.title')
      );
    });
    this.comics_subscription = this.libraryAdaptor.comic$.subscribe(comics => {
      this.comic_count = comics.length;
      this.plural = this.comic_count !== 1;
    });
    this.publishers_subscription = this.libraryAdaptor.publisher$.subscribe(
      publishers => {
        this.publishers = publishers;
        this.build_data();
      }
    );
    this.series_subscription = this.libraryAdaptor.serie$.subscribe(series => {
      this.series = series;
      this.build_data();
    });
    this.characters_subscription = this.libraryAdaptor.character$.subscribe(
      characters => {
        this.characters = characters;
        this.build_data();
      }
    );
    this.teams_subscription = this.libraryAdaptor.team$.subscribe(teams => {
      this.teams = teams;
      this.build_data();
    });
    this.locations_subscription = this.libraryAdaptor.location$.subscribe(
      locations => {
        this.locations = locations;
        this.build_data();
      }
    );
    this.breadcrumbAdaptor.loadEntries([]);
  }

  ngOnDestroy() {
    this.comics_subscription.unsubscribe();
    this.publishers_subscription.unsubscribe();
    this.series_subscription.unsubscribe();
    this.characters_subscription.unsubscribe();
    this.teams_subscription.unsubscribe();
    this.locations_subscription.unsubscribe();
  }

  sort(elements: ComicCollectionEntry[]): ComicCollectionEntry[] {
    return elements.sort(
      (left: ComicCollectionEntry, right: ComicCollectionEntry) => {
        if (left.count < right.count) {
          return 1;
        }

        if (left.count > right.count) {
          return -1;
        }

        return 0;
      }
    );
  }

  build_data(): void {
    const names = [];
    const counts = [];

    switch (this.data_to_show) {
      case 'publishers':
        this.sort(this.publishers).forEach(publisher => {
          names.push(publisher.name);
          counts.push(publisher.count);
        });
        this.options.title.text = 'Data For Most Common Publishers';
        break;

      case 'series':
        this.sort(this.series).forEach(series => {
          names.push(series.name);
          counts.push(series.count);
        });
        this.options.title.text = 'Data For Most Common Series';
        break;

      case 'characters':
        this.sort(this.characters).forEach(character => {
          names.push(character.name);
          counts.push(character.count);
        });
        this.options.title.text = 'Data For Most Common Characters';
        break;

      case 'teams':
        this.sort(this.teams).forEach(team => {
          names.push(team.name);
          counts.push(team.count);
        });
        this.options.title.text = 'Data For Most Common Teams';
        break;

      case 'locations':
        this.sort(this.locations).forEach(location => {
          names.push(location.name);
          counts.push(location.count);
        });
        this.options.title.text = 'Data For Most Common Locations';
        break;
    }

    this.library_data = {
      labels: names.slice(0, 15),
      datasets: [
        {
          data: counts.slice(0, 15),
          backgroundColor: COLOR_PALLETTE,
          hoverBackgroundColor: COLOR_PALLETTE
        }
      ]
    };
  }
}
