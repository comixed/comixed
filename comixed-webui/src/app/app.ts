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
import { LoggerService } from '@angular-ru/cdk/logger';
import { LibraryService } from '@app/library/services/library-service';
import { WebSocketService } from '@app/messaging/services/web-socket-service';
import { Router, RouterOutlet } from '@angular/router';
import { Topbar } from '@app/layout/components/topbar/topbar';
import { Store } from '@ngrx/store';
import {
  selectExistingAdminAccountChecked,
  selectExistingAdminAccountCreate
} from '@app/account/selectors/existing-admin-account.selectors';
import { ExistingAdminAccountActions } from '@app/account/actions/existing-admin-account.actions';
import { CurrentUserActions } from '@app/account/actions/current-user.actions';
import { selectCurrentUserAuthenticated } from '@app/account/selectors/current-user.selectors';
import { Toast } from '@openng/optimus-ui/toast';

@Component({
  imports: [Topbar, RouterOutlet, Toast],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html'
})
export class App {
  readonly logger = inject(LoggerService);
  readonly store = inject(Store);
  readonly router = inject(Router);
  readonly libraryService = inject(LibraryService);
  readonly webSocketService = inject(WebSocketService);

  constructor() {
    this.store.select(selectExistingAdminAccountChecked).subscribe({
      next: checked => {
        if (!checked) {
          this.logger.trace('Initiating checking for existing admin account');
          this.store.dispatch(ExistingAdminAccountActions.check());
        }
      }
    });
    this.store.select(selectExistingAdminAccountCreate).subscribe({
      next: create => {
        if (create) {
          this.logger.trace('Redirecting to account creation page');
          this.router.navigateByUrl('/accounts/initial');
        } else {
          this.logger.trace('Loading current user');
          this.store.dispatch(CurrentUserActions.load());
        }
      }
    });
    this.store.select(selectCurrentUserAuthenticated).subscribe({
      next: authenticated => {
        if (authenticated) {
          this.webSocketService.connect().subscribe();
          this.libraryService.loadLibraryState();
        } else {
          this.webSocketService.disconnect();
        }
      }
    });
  }
}
