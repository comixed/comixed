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
import { LoggerService } from '@angular-ru/cdk/logger';
import { HttpClient } from '@angular/common/http';
import { LOAD_LIBRARY_STATE_URL } from '@app/library/library-constants';
import { interpolate } from '@app/app-functions';
import { MessagingStore } from '@app/messaging/stores/messaging-store';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { LibraryStore } from '@app/library/stores/library-store';
import { RemoteLibraryState } from '@app/library/models/net/remote-library-state';

@Service()
export class LibraryService {
  logger = inject(LoggerService);
  client = inject(HttpClient);
  readonly libraryStore = inject(LibraryStore);
  readonly messagingStore = inject(MessagingStore);

  constructor() {
    toObservable(this.messagingStore.isStarted)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: started => {
          if (started) {
            this.logger.trace('Loading the comic library state');
            this.loadLibraryState();
          }
        }
      });
  }

  loadLibraryState(): void {
    this.logger.trace('Loading remote library state');
    this.client.get(interpolate(LOAD_LIBRARY_STATE_URL)).subscribe({
      next: state => {
        this.logger.debug('Response received:', state);
        this.libraryStore.updateState(state as RemoteLibraryState);
      },
      error: error =>
        this.logger.error('Failed to load remote library state', error)
    });
  }
}
