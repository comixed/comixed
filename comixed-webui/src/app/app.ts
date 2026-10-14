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
import { AccountService } from '@app/account/services/account-service';
import { CurrentUserStore } from '@app/account/stores/current-user-store';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { LibraryService } from '@app/library/services/library-service';
import { WebSocketService } from '@app/messaging/services/web-socket-service';
import { RouterOutlet } from '@angular/router';
import { Topbar } from '@app/layout/components/topbar/topbar';

@Component({
  imports: [RouterOutlet, Topbar],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html'
})
export class App {
  private readonly authenticationService = inject(AccountService);
  private readonly libraryService = inject(LibraryService);
  private readonly currentUserStore = inject(CurrentUserStore);
  private readonly webSocketService = inject(WebSocketService);
  private readonly logger = inject(LoggerService);

  constructor() {
    toObservable<boolean>(this.currentUserStore.isAuthenticated)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: value => {
          if (value) {
            this.logger.trace('Connecting the websocket');
            this.webSocketService.connect().subscribe();
            this.logger.trace('Loading the remote library state');
            this.libraryService.loadLibraryState();
          } else {
            this.logger.trace('Disconnecting the websocket');
            this.webSocketService.disconnect();
          }
        }
      });
    this.logger.trace('Fetching the current user');
    this.authenticationService.loadCurrentUser();
  }
}
