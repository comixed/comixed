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
import { LoggerModule } from '@angular-ru/logger';
import { Store } from '@ngrx/store';
import { selectImportCount } from '@app/selectors/import-count.selectors';
import { User } from '@app/user';
import {
  selectComicListCount,
  selectComicListDeletedCount,
  selectComicListReadCount
} from '@app/library/selectors/comic-list.selectors';

@Component({
  selector: 'cx-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  @Input() user: User;

  importCount = 0;
  comicCount = 0;
  readCount = 0;
  deletedCount = 0;

  constructor(private logger: LoggerModule, private store: Store<any>) {
    this.store
      .select(selectImportCount)
      .subscribe(count => (this.importCount = count));
    this.store
      .select(selectComicListCount)
      .subscribe(count => (this.comicCount = count));
    this.store
      .select(selectComicListReadCount)
      .subscribe(count => (this.readCount = count));
    this.store
      .select(selectComicListDeletedCount)
      .subscribe(count => (this.deletedCount = count));
  }

  ngOnInit(): void {}
}
