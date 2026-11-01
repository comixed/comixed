/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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

import { Component, inject } from '@angular/core';
import { Button } from '@openng/optimus-ui/button';
import { Tooltip } from '@openng/optimus-ui/tooltip';
import { TranslatePipe } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { selectUserIsAdmin } from '@app/account/selectors/user.selectors';
import { selectSelectedComicListCount } from '@app/library/selectors/selected-comic-list.selectors';
import { DialogService } from '@openng/optimus-ui/dynamicdialog';
import {
  ReadComicStateDecision,
  ReadStateDialog
} from '@app/layout/components/read-state-dialog/read-state-dialog';
import { LoggerService } from '@angular-ru/cdk/logger';
import { ReadComicListActions } from '@app/account/actions/read-comic-list.actions';

@Component({
  imports: [Button, Tooltip, TranslatePipe],
  selector: 'app-selected-comic-toolbar',
  styleUrl: './selected-comic-toolbar.scss',
  templateUrl: './selected-comic-toolbar.html'
})
export class SelectedComicToolbar {
  readonly logger = inject(LoggerService);
  readonly store = inject(Store);
  readonly isAdmin = this.store.selectSignal(selectUserIsAdmin);
  readonly selectedComicCount = this.store.selectSignal(
    selectSelectedComicListCount
  );
  readonly dialogService = inject(DialogService);

  onMarkSelectedRead() {
    this.dialogService.open(ReadStateDialog, {})?.onClose.subscribe({
      next: (choice: ReadComicStateDecision) => {
        switch (choice) {
          case ReadComicStateDecision.MarkRead:
            this.logger.debug('Marking selected comics as read');
            this.store.dispatch(
              ReadComicListActions.markSelectedComics({ readState: true })
            );
            break;
          case ReadComicStateDecision.MarkUnread:
            this.logger.debug('Unmarking selected comics as read');
            this.store.dispatch(
              ReadComicListActions.markSelectedComics({ readState: false })
            );
            break;
          case ReadComicStateDecision.Cancel:
            this.logger.debug('Canceled marking comics');
            break;
        }
      }
    });
  }
}
