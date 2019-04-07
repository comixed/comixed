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
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import { Router } from '@angular/router';
import { Comic } from 'app/models/comics/comic';
import { Library } from 'app/models/actions/library';
import { Store } from '@ngrx/store';
import { AppState } from 'app/app.state';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import * as LibraryActions from 'app/actions/library.actions';
import * as DisplayActions from 'app/actions/library-display.actions';
import { MenuItem } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { LibraryDisplay } from 'app/models/state/library-display';

@Component({
  selector: 'app-selected-comics-list',
  templateUrl: './selected-comics-list.component.html',
  styleUrls: ['./selected-comics-list.component.css']
})
export class SelectedComicsListComponent implements OnInit, OnDestroy {
  @Input() rows: number;
  @Input() cover_size: number;
  @Input() same_height: boolean;

  protected actions: MenuItem[];

  private library$: Observable<Library>;
  private library_subscription: Subscription;
  library: Library;

  private library_display$: Observable<LibraryDisplay>;
  private library_display_subscription: Subscription;
  library_display: LibraryDisplay;

  constructor(
    private router: Router,
    private store: Store<AppState>,
    private translate: TranslateService
  ) {
    this.library$ = this.store.select('library');
    this.library_display$ = this.store.select('library_display');
  }

  ngOnInit() {
    this.load_actions();
    this.library_subscription = this.library$.subscribe((library: Library) => {
      this.library = library;
    });
    this.library_display_subscription = this.library_display$.subscribe((library_display: LibraryDisplay) => {
      this.library_display = library_display;
    });
  }

  private load_actions(): void {
    this.actions = [
      {
        label: this.translate.instant('selected-comics-list.button.scrape'),
        icon: 'fa fa-fw fa-cloud',
        routerLink: ['/scraping']
      }
    ];
  }

  ngOnDestroy() {
    this.library_subscription.unsubscribe();
    this.library_display_subscription.unsubscribe();
  }

  set_selected(comic: Comic): void {
    this.store.dispatch(
      new LibraryActions.LibrarySetSelected({
        comic: comic,
        selected: false
      })
    );
  }

  hide_selections(): void {
    this.store.dispatch(new DisplayActions.LibraryViewToggleSidebar({ show: false }));
  }
}
