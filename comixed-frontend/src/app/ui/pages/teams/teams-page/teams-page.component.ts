/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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
import { AppState } from 'app/app.state';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { SelectItem } from 'primeng/api';
import { ComicCollectionEntry } from 'app/library/models/comic-collection-entry';
import { LibraryAdaptor } from 'app/library';

@Component({
  selector: 'app-teams-page',
  templateUrl: './teams-page.component.html',
  styleUrls: ['./teams-page.component.css']
})
export class TeamsPageComponent implements OnInit, OnDestroy {
  teams_subscription: Subscription;
  teams: ComicCollectionEntry[];

  protected rows_options: Array<SelectItem>;
  rows = 10;

  constructor(
    private library_adaptor: LibraryAdaptor,
    private translate: TranslateService,
    private store: Store<AppState>
  ) {}

  ngOnInit() {
    this.teams_subscription = this.library_adaptor.team$.subscribe(
      teams => (this.teams = teams)
    );
    this.load_rows_options();
  }

  ngOnDestroy() {
    this.teams_subscription.unsubscribe();
  }

  private load_rows_options(): void {
    this.rows_options = [
      {
        label: this.translate.instant(
          'library-contents.options.rows.10-per-page'
        ),
        value: 10
      },
      {
        label: this.translate.instant(
          'library-contents.options.rows.25-per-page'
        ),
        value: 25
      },
      {
        label: this.translate.instant(
          'library-contents.options.rows.50-per-page'
        ),
        value: 50
      },
      {
        label: this.translate.instant(
          'library-contents.options.rows.100-per-page'
        ),
        value: 100
      }
    ];
  }
}
