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

import { inject, Service } from '@angular/core';
import { MessageService } from '@openng/optimus-ui/api';
import { Router } from '@angular/router';
import { LoggerService } from '@angular-ru/cdk/logger';

@Service()
export class AlertService {
  private readonly logger = inject(LoggerService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);

  info(message: string): void {
    this.logger.trace('Showing message: INFO');
    this.messageService.add({ severity: 'info', detail: message });
  }

  error(message: string, redirectTo = ''): void {
    this.logger.trace('Showing message: ERROR');
    this.messageService.add({ severity: 'error', detail: message });
    if (redirectTo.length > 0) {
      this.logger.trace('Redirecting the browser');
      this.router.navigateByUrl(redirectTo);
    }
  }
}
