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
import { Comic } from 'app/library';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from 'app/app.state';
import { Observable, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { SelectionState } from 'app/models/state/selection-state';
import { LibraryAdaptor } from 'app/library';

@Component({
  selector: 'app-character-details-page',
  templateUrl: './character-details-page.component.html',
  styleUrls: ['./character-details-page.component.css']
})
export class CharacterDetailsPageComponent implements OnInit, OnDestroy {
  character_subscription: Subscription;
  comics: Comic[];

  selection_state$: Observable<SelectionState>;
  selection_state_subscription: Subscription;
  selection_state: SelectionState;

  protected layout = 'grid';
  protected sort_field = 'volume';
  protected rows = 10;
  protected same_height = true;
  protected cover_size = 200;

  character_name: string;
  selected_comics: Array<Comic> = [];

  constructor(
    private library_adaptor: LibraryAdaptor,
    private activatedRoute: ActivatedRoute,
    private translate: TranslateService,
    private store: Store<AppState>
  ) {
    this.activatedRoute.params.subscribe(params => {
      this.character_name = params['name'];
    });
    this.selection_state$ = store.select('selections');
  }

  ngOnInit() {
    this.character_subscription = this.library_adaptor.character$.subscribe(
      characters => {
        const result = characters.find(
          character => character.name === this.character_name
        );
        this.comics = result ? result.comics : [];
      }
    );
    this.selection_state_subscription = this.selection_state$.subscribe(
      (selection_state: SelectionState) => {
        this.selection_state = selection_state;
        this.selected_comics = [].concat(this.selection_state.selected_comics);
      }
    );
  }

  ngOnDestroy() {
    this.character_subscription.unsubscribe();
    this.selection_state_subscription.unsubscribe();
  }

  set_layout(dataview: any, layout: string): void {
    dataview.changeLayout(layout);
  }

  set_sort_field(sort_field: string): void {
    this.sort_field = sort_field;
  }

  set_rows(rows: number): void {
    this.rows = rows;
  }

  set_cover_size(cover_size: number): void {
    this.cover_size = cover_size;
  }

  set_same_height(same_height: boolean): void {
    this.same_height = same_height;
  }
}
