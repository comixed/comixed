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
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { AppState } from 'app/app.state';
import { ComicGrouping, Library } from 'app/models/actions/library';
import { SelectItem } from 'primeng/api';

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
  styleUrls: ['./main-page.component.css']
})
export class MainPageComponent implements OnInit, OnDestroy {
  private library$: Observable<Library>;
  private library_subscription: Subscription;
  library: Library;

  public comic_count: number;
  public plural = false;

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

  constructor(private store: Store<AppState>) {
    this.library$ = store.select('library');
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
    this.library_subscription = this.library$.subscribe((library: Library) => {
      this.library = library;
      this.comic_count = library.comics.length;
      this.plural = this.comic_count !== 1;

      this.build_data();
    });
  }

  ngOnDestroy() {
    this.library_subscription.unsubscribe();
  }

  sort(elements: Array<ComicGrouping>): Array<ComicGrouping> {
    return elements.sort((left: ComicGrouping, right: ComicGrouping) => {
      if (left.comic_count < right.comic_count) {
        return 1;
      }

      if (left.comic_count > right.comic_count) {
        return -1;
      }

      return 0;
    });
  }

  build_data(): void {
    const names = [];
    const counts = [];

    switch (this.data_to_show) {
      case 'publishers':
        this.sort(this.library.publishers).forEach(publisher => {
          names.push(publisher.name);
          counts.push(publisher.comic_count);
        });
        this.options.title.text = 'Data For Most Common Publishers';
        break;

      case 'series':
        this.sort(this.library.series).forEach(series => {
          names.push(series.name);
          counts.push(series.comic_count);
        });
        this.options.title.text = 'Data For Most Common Series';
        break;

      case 'characters':
        this.sort(this.library.characters).forEach(character => {
          names.push(character.name);
          counts.push(character.comic_count);
        });
        this.options.title.text = 'Data For Most Common Characters';
        break;

      case 'teams':
        this.sort(this.library.teams).forEach(team => {
          names.push(team.name);
          counts.push(team.comic_count);
        });
        this.options.title.text = 'Data For Most Common Teams';
        break;

      case 'locations':
        this.sort(this.library.locations).forEach(location => {
          names.push(location.name);
          counts.push(location.comic_count);
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
