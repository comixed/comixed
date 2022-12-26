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
import { LoggerService } from '@angular-ru/cdk/logger';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

export const INFO_MESSAGE_DURATION = 5000;
export const ERROR_MESSAGE_DURATION = undefined;
export const ALERT_HORZ_POSITION = 'center';
export const ALERT_VERT_POSITION = 'top';

/**
 * AlertService shows message toasters to the user.
 */
@Injectable({
  providedIn: 'root'
})
export class AlertService {
  constructor(
    private logger: LoggerService,
    private translateService: TranslateService,
    private snackbar: MatSnackBar
  ) {}

  /** Shows an information alert. */
  info(message: string): void {
    this.logger.trace('Showing info message:', message);
    this.snackbar.open(
      message,
      this.translateService.instant('alert.info-action'),
      {
        duration: INFO_MESSAGE_DURATION,
        horizontalPosition: ALERT_HORZ_POSITION,
        verticalPosition: ALERT_VERT_POSITION,
        panelClass: ['cx-info-alert']
      }
    );
  }

  /** Shows an error alert. */
  error(message: string): void {
    this.logger.trace('Showing error message:', message);
    this.snackbar.open(
      message,
      this.translateService.instant('alert.error-action'),
      {
        duration: ERROR_MESSAGE_DURATION,
        horizontalPosition: ALERT_HORZ_POSITION,
        verticalPosition: ALERT_VERT_POSITION,
        panelClass: ['cx-error-alert']
      }
    );
  }
}
