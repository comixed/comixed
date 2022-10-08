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

import { Component, Inject, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DuplicatePage } from '@app/library/models/duplicate-page';
import { ComicBook } from '@app/comic-books/models/comic-book';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { selectComicBookList } from '@app/comic-books/selectors/comic-book-list.selectors';
import { LoggerService } from '@angular-ru/cdk/logger';

@Component({
  selector: 'cx-comics-with-duplicate-page',
  templateUrl: './comics-with-duplicate-page.component.html',
  styleUrls: ['./comics-with-duplicate-page.component.scss']
})
export class ComicsWithDuplicatePageComponent implements OnDestroy {
  comicBookSubscription: Subscription;
  comicBooks: ComicBook[] = [];

  constructor(
    private logger: LoggerService,
    @Inject(MAT_DIALOG_DATA) public page: DuplicatePage,
    private store: Store<any>
  ) {
    this.comicBookSubscription = this.store
      .select(selectComicBookList)
      .subscribe(comicBooks => {
        this.logger.trace('Comic book update received');
        this.comicBooks = comicBooks.filter(comicBook =>
          this.page.ids.includes(comicBook.id)
        );
      });
  }

  ngOnDestroy(): void {
    this.logger.trace('Unsubscribing from comic book updates');
    this.comicBookSubscription.unsubscribe();
  }
}
