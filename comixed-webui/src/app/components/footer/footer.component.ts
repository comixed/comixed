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

import { Component, Input } from '@angular/core';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import { User } from '@app/user/models/user';
import { selectLastReadEntries } from '@app/last-read/selectors/last-read-list.selectors';
import { selectLibraryState } from '@app/library/selectors/library.selectors';
import { selectComicBookSelectionState } from '@app/comic-books/selectors/comic-book-selection.selectors';

@Component({
  selector: 'cx-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  @Input() user: User;

  importCount = 0;
  comicCount = 0;
  readCount = 0;
  selectedCount = 0;
  deletedCount = 0;

  constructor(private logger: LoggerModule, private store: Store<any>) {
    this.store.select(selectLibraryState).subscribe(state => {
      this.comicCount = state.totalComics;
      this.importCount = state.unscrapedComics;
      this.deletedCount = state.deletedComics;
    });
    this.store
      .select(selectLastReadEntries)
      .subscribe(entries => (this.readCount = entries.length));
    this.store
      .select(selectComicBookSelectionState)
      .subscribe(state => (this.selectedCount = state.ids.length));
  }
}
