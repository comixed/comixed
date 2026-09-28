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
import { Card } from '@openng/optimus-ui/card';
import { TranslatePipe } from '@ngx-translate/core';
import { DynamicDialogRef } from '@openng/optimus-ui/dynamicdialog';
import { LoggerService } from '@angular-ru/cdk/logger';

export enum ReadComicStateDecision {
  MarkRead,
  MarkUnread,
  Cancel
}

@Component({
  imports: [Button, Card, TranslatePipe],
  selector: 'app-read-state-dialog',
  styleUrl: './read-state-dialog.scss',
  templateUrl: './read-state-dialog.html'
})
export class ReadStateDialog {
  readonly logger = inject(LoggerService);
  readonly dialogRef = inject(DynamicDialogRef);

  onMarkRead(): void {
    this.logger.debug('User selected to mark comics as read');
    this.dialogRef.close(ReadComicStateDecision.MarkRead);
  }

  onMarkUnread(): void {
    this.logger.debug('User selected to unmark comics as read');
    this.dialogRef.close(ReadComicStateDecision.MarkUnread);
  }

  onCancel(): void {
    this.logger.debug('User canceled the dialog');
    this.dialogRef.close(ReadComicStateDecision.Cancel);
  }
}
