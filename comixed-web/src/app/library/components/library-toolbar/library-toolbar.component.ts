/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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

import { Component, Input, OnInit } from '@angular/core';
import { Comic } from '@app/library';
import { LoggerService } from '@angular-ru/logger';
import { Store } from '@ngrx/store';
import {
  deselectComics,
  selectComics
} from '@app/library/actions/library.actions';

@Component({
  selector: 'cx-library-toolbar',
  templateUrl: './library-toolbar.component.html',
  styleUrls: ['./library-toolbar.component.scss']
})
export class LibraryToolbarComponent implements OnInit {
  @Input() comics: Comic[] = [];
  @Input() selected: Comic[] = [];

  constructor(private logger: LoggerService, private store: Store<any>) {}

  ngOnInit(): void {}

  onSelectAll(): void {
    this.logger.debug('Selecting all comics');
    this.store.dispatch(selectComics({ comics: this.comics }));
  }

  onDeselectAll(): void {
    this.logger.debug('Deselecting all comics');
    this.store.dispatch(deselectComics({ comics: this.selected }));
  }
}
