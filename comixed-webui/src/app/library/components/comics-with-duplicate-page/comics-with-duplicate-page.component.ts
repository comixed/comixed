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
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { selectComicBookList } from '@app/comic-books/selectors/comic-book-list.selectors';
import { LoggerService } from '@angular-ru/cdk/logger';
import { ComicDetail } from '@app/comic-books/models/comic-detail';
import { MatTableDataSource } from '@angular/material/table';
import { SelectableListItem } from '@app/core/models/ui/selectable-list-item';

@Component({
  selector: 'cx-comics-with-duplicate-page',
  templateUrl: './comics-with-duplicate-page.component.html',
  styleUrls: ['./comics-with-duplicate-page.component.scss']
})
export class ComicsWithDuplicatePageComponent implements OnDestroy {
  dataSource = new MatTableDataSource<SelectableListItem<ComicDetail>>([]);

  comicBookSubscription: Subscription;

  constructor(
    private logger: LoggerService,
    @Inject(MAT_DIALOG_DATA) public page: DuplicatePage,
    private store: Store<any>
  ) {
    this.comicBookSubscription = this.store
      .select(selectComicBookList)
      .subscribe(comicBooks => {
        this.logger.trace('Comic book update received');
        this.comics = comicBooks.filter(comicBook =>
          this.page.ids.includes(comicBook.id)
        );
      });
  }

  get comics(): ComicDetail[] {
    return this.dataSource.data.map(entry => entry.item);
  }

  set comics(details: ComicDetail[]) {
    this.dataSource.data = details.map(comic => {
      return { item: comic, selected: false };
    });
  }

  ngOnDestroy(): void {
    this.logger.trace('Unsubscribing from comic book updates');
    this.comicBookSubscription.unsubscribe();
  }
}
