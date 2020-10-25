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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SelectItem } from 'primeng/api';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationAdaptor } from 'app/user';
import { ComicCollectionEntry } from 'app/library/models/comic-collection-entry';
import { LibraryAdaptor } from 'app/library';
import { Store } from '@ngrx/store';
import { AppState } from 'app/app-state';
import { clearBreadcrumbs } from 'app/actions/breadcrumb.actions';

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
  authSubscription: Subscription;
  authenticated = false;
  comicsSubscription: Subscription;
  publishersSubscription: Subscription;
  publishers: ComicCollectionEntry[];
  seriesSubscription: Subscription;
  series: ComicCollectionEntry[];
  charactersSubscription: Subscription;
  characters: ComicCollectionEntry[];
  teamsSubscription: Subscription;
  teams: ComicCollectionEntry[];
  locationsSubscription: Subscription;
  locations: ComicCollectionEntry[];
  comicCount: number;
  plural = false;

  libraryData: any;
  options: any;
  dataOptions: Array<SelectItem> = [
    { label: 'Publishers', value: 'publishers' },
    { label: 'Series', value: 'series' },
    { label: 'Characters', value: 'characters' },
    { label: 'Teams', value: 'teams' },
    { label: 'Locations', value: 'locations' }
  ];
  dataToShow = 'publishers';

  constructor(
    private store: Store<AppState>,
    private titleService: Title,
    private translateService: TranslateService,
    private authenticationAdaptor: AuthenticationAdaptor,
    private libraryAdaptor: LibraryAdaptor
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
    this.authSubscription = this.authenticationAdaptor.authenticated$.subscribe(
      authenticated => (this.authenticated = authenticated)
    );
    this.translateService.onLangChange.subscribe(() => {
      this.titleService.setTitle(
        this.translateService.instant('main-page.title')
      );
    });
    this.comicsSubscription = this.libraryAdaptor.comic$.subscribe(comics => {
      this.comicCount = comics.length;
      this.plural = this.comicCount !== 1;
    });
    this.publishersSubscription = this.libraryAdaptor.publishers$.subscribe(
      publishers => {
        this.publishers = publishers;
        this.buildData();
      }
    );
    this.seriesSubscription = this.libraryAdaptor.series$.subscribe(series => {
      this.series = series;
      this.buildData();
    });
    this.charactersSubscription = this.libraryAdaptor.characters$.subscribe(
      characters => {
        this.characters = characters;
        this.buildData();
      }
    );
    this.teamsSubscription = this.libraryAdaptor.teams$.subscribe(teams => {
      this.teams = teams;
      this.buildData();
    });
    this.locationsSubscription = this.libraryAdaptor.locations$.subscribe(
      locations => {
        this.locations = locations;
        this.buildData();
      }
    );
    this.store.dispatch(clearBreadcrumbs());
  }

  ngOnDestroy() {
    this.authSubscription.unsubscribe();
    this.comicsSubscription.unsubscribe();
    this.publishersSubscription.unsubscribe();
    this.seriesSubscription.unsubscribe();
    this.charactersSubscription.unsubscribe();
    this.teamsSubscription.unsubscribe();
    this.locationsSubscription.unsubscribe();
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

  buildData(): void {
    const names = [];
    const counts = [];

    switch (this.dataToShow) {
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

    this.libraryData = {
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
