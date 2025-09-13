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
import { selectLibraryState } from '@app/library/selectors/library.selectors';
import { selectComicBookSelectionState } from '@app/comic-books/selectors/comic-book-selection.selectors';
import { Subscription } from 'rxjs';
import { selectBatchProcessList } from '@app/admin/selectors/batch-processes.selectors';
import { TranslateModule } from '@ngx-translate/core';
import { isAdmin } from '@app/user/user.functions';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'cx-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  imports: [RouterModule, TranslateModule]
})
export class FooterComponent {
  libraryStateSubscription: Subscription;
  selectionsSubscription: Subscription;
  jobsSubscription: Subscription;
  unscrapedCount = 0;
  comicCount = 0;
  readCount = 0;
  selectedCount = 0;
  deletedCount = 0;
  batchJobs = 0;

  logger = inject(LoggerService);
  store = inject(Store<any>);

  private _user: User = null;

  get user(): User {
    return this._user;
  }

  @Input() set user(user: User) {
    this._user = user;

    if (!!this._user) {
      this.logger.debug('User updated:', user);
      this.libraryStateSubscription = this.store
        .select(selectLibraryState)
        .subscribe(state => {
          this.comicCount = state.totalComics;
          this.unscrapedCount = state.unscrapedComics;
          this.deletedCount = state.deletedComics;
        });
      this.selectionsSubscription = this.store
        .select(selectComicBookSelectionState)
        .subscribe(state => (this.selectedCount = state.ids.length));
      this.jobsSubscription = this.store
        .select(selectBatchProcessList)
        .subscribe(
          list => (this.batchJobs = list.filter(job => job.running).length)
        );
      this.readCount = this.user.readComicBooks.length;
    } else {
      this.libraryStateSubscription?.unsubscribe();
      this.selectionsSubscription?.unsubscribe();
      this.jobsSubscription?.unsubscribe();
      this.readCount = 0;
    }
  }

  get isAdmin(): boolean {
    return isAdmin(this.user);
  }
}
