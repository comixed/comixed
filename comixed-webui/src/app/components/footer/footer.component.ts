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

import { Component, inject, Input } from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import { User } from '@app/user/models/user';
import {
  selectLibraryDeletedComicCount,
  selectLibraryTotalComicCount,
  selectLibraryUnscrapedComicCount
} from '@app/library/selectors/library.selectors';
import { selectComicBookSelectionCount } from '@app/comic-books/selectors/comic-book-selection.selectors';
import { selectBatchProcessList } from '@app/admin/selectors/batch-processes.selectors';
import { TranslateModule } from '@ngx-translate/core';
import { isAdmin } from '@app/user/user.functions';
import { RouterModule } from '@angular/router';
import { tap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'cx-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  imports: [RouterModule, TranslateModule, AsyncPipe]
})
export class FooterComponent {
  unscrapedCount$ = new BehaviorSubject(0);
  comicCount$ = new BehaviorSubject(0);
  readCount$ = new BehaviorSubject(0);
  selectedCount$ = new BehaviorSubject(0);
  deletedCount$ = new BehaviorSubject(0);
  batchJobs$ = new BehaviorSubject(0);

  logger = inject(LoggerService);
  store = inject(Store<any>);

  private _user: User = null;

  get user(): User {
    return this._user;
  }

  @Input() set user(user: User) {
    this._user = user;

    if (!!this._user) {
      this.store
        .select(selectLibraryTotalComicCount)
        .pipe(tap(totalComics => this.comicCount$.next(totalComics)))
        .subscribe();
      this.store
        .select(selectLibraryUnscrapedComicCount)
        .pipe(
          tap(unscrapedComics => this.unscrapedCount$.next(unscrapedComics))
        )
        .subscribe();
      this.store
        .select(selectLibraryDeletedComicCount)
        .pipe(tap(deletedComics => this.deletedCount$.next(deletedComics)))
        .subscribe();
      this.store
        .select(selectComicBookSelectionCount)
        .pipe(tap(count => this.selectedCount$.next(count)))
        .subscribe();
      this.store
        .select(selectBatchProcessList)
        .pipe(
          tap(list =>
            this.batchJobs$.next(list.filter(job => job.running).length)
          )
        )
        .subscribe();
      this.readCount$.next(this.user.readComicBooks.length);
    } else {
      this.readCount$.next(0);
    }
  }

  get isAdmin(): boolean {
    return isAdmin(this.user);
  }
}
