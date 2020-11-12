/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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

import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { LoggerService } from '@angular-ru/logger';
import { ConfirmationDialogModel } from '@app/core/models/confirmation-dialog-model';
import { Confirmation } from '@app/core/models/confirmation';
import { ConfirmationComponent } from '@app/core/components/confirmation/confirmation.component';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {
  constructor(
    private logger: LoggerService,
    private translateService: TranslateService,
    private dialog: MatDialog
  ) {}

  confirm(confirmation: Confirmation): void {
    this.logger.trace('Showing confirmation dialog:', confirmation);
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      data: {
        title: confirmation.title,
        message: confirmation.message,
        yesButton: this.translateService.instant('button.yes'),
        noButton: this.translateService.instant('button.no')
      } as ConfirmationDialogModel
    });
    dialogRef.afterClosed().subscribe(accepted => {
      if (accepted) {
        confirmation.confirm();
      }
    });
  }
}
