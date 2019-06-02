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

import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { Router } from '@angular/router';
import { Comic } from 'app/models/comics/comic';
import { Store } from '@ngrx/store';
import { AppState } from 'app/app.state';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import * as LibraryActions from 'app/actions/library.actions';
import * as DisplayActions from 'app/actions/library-display.actions';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { LibraryDisplay } from 'app/models/state/library-display';
import { ReadingListState } from 'app/models/state/reading-list-state';
import { ReadingList } from 'app/models/reading-list';
import * as ReadingListActions from 'app/actions/reading-list.actions';
import { ReadingListEntry } from 'app/models/reading-list-entry';
import { ComicSelectionEntry } from 'app/models/ui/comic-selection-entry';

@Component({
  selector: 'app-selected-comics-list',
  templateUrl: './selected-comics-list.component.html',
  styleUrls: ['./selected-comics-list.component.css']
})
export class SelectedComicsListComponent implements OnInit, OnDestroy {
  @Input() comics: Array<Comic> = [];
  @Input() rows: number;
  @Input() cover_size: number;
  @Input() same_height: boolean;

  @Output() selectionChange = new EventEmitter<ComicSelectionEntry>();

  protected actions: MenuItem[];
  protected reading_list_actions: MenuItem[];

  private library_display$: Observable<LibraryDisplay>;
  private library_display_subscription: Subscription;
  library_display: LibraryDisplay;

  private reading_list_state$: Observable<ReadingListState>;
  private reading_list_state_subscription: Subscription;
  private reading_list_state: ReadingListState;

  constructor(
    private router: Router,
    private store: Store<AppState>,
    private translate: TranslateService,
    private confirmation_service: ConfirmationService
  ) {
    this.library_display$ = this.store.select('library_display');
    this.reading_list_state$ = this.store.select('reading_lists');
  }

  ngOnInit() {
    this.load_actions();
    this.library_display_subscription = this.library_display$.subscribe(
      (library_display: LibraryDisplay) => {
        this.library_display = library_display;
      }
    );
    this.reading_list_state_subscription = this.reading_list_state$.subscribe(
      (reading_list_state: ReadingListState) => {
        this.reading_list_state = reading_list_state;
        if (this.reading_list_state.reading_lists) {
          this.reading_list_actions = [];
          this.reading_list_state.reading_lists.forEach(
            (reading_list: ReadingList) => {
              this.reading_list_actions.push({
                label: reading_list.name,
                icon: 'fa fa-fw fa-plus',
                command: () => this.add_to_reading_list(reading_list)
              });
            }
          );
        }
      }
    );
    this.store.dispatch(new ReadingListActions.ReadingListGetAll());
  }

  add_to_reading_list(reading_list: ReadingList): void {
    const entries = reading_list.entries;
    this.comics.forEach((comic: Comic) => {
      if (
        !entries.find((entry: ReadingListEntry) => entry.comic.id === comic.id)
      ) {
        entries.push({ id: null, comic: comic });
      }
    });

    this.store.dispatch(
      new ReadingListActions.ReadingListSave({
        reading_list: { ...reading_list, entries: entries }
      })
    );
  }

  private load_actions(): void {
    this.actions = [
      {
        label: this.translate.instant('selected-comics-list.button.scrape'),
        icon: 'fa fa-fw fa-cloud',
        routerLink: ['/scraping']
      },
      {
        label: this.translate.instant('selected-comics-list.button.delete'),
        icon: 'fas fa-trash',
        command: () => this.delete_comics()
      }
    ];
  }

  ngOnDestroy() {
    this.library_display_subscription.unsubscribe();
  }

  hide_selections(): void {
    this.store.dispatch(
      new DisplayActions.LibraryViewToggleSidebar({ show: false })
    );
  }

  delete_comics(): void {
    this.confirmation_service.confirm({
      header: this.translate.instant(
        'selected-comics-list.title.delete-comics',
        { comic_count: this.comics.length }
      ),
      message: this.translate.instant(
        'selected-comics-list.text.delete-comics'
      ),
      icon: 'fas fa-trash',
      accept: () =>
        this.store.dispatch(
          new LibraryActions.LibraryDeleteMultipleComics({
            comics: this.comics
          })
        )
    });
  }
}
