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

import { Component, inject, Renderer2 } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { AppState } from '@app/stores/app-store';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { LoggerService } from '@angular-ru/cdk/logger';
import { CurrentUserStore } from '@app/account/stores/current-user-store';
import { RouterLink } from '@angular/router';

@Component({
  imports: [MatIcon, MatIconButton, RouterLink],
  selector: 'app-topbar',
  styleUrl: './topbar.scss',
  templateUrl: './topbar.html'
})
export class Topbar {
  readonly logger = inject(LoggerService);
  readonly appStore = inject(AppState);
  readonly currentUserStore = inject(CurrentUserStore);
  readonly renderer = inject(Renderer2);

  constructor() {
    toObservable(this.appStore.darkMode)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: value => {
          if (value) {
            this.renderer.setStyle(
              document.documentElement,
              'color-scheme',
              'dark'
            );
          } else {
            this.renderer.setStyle(
              document.documentElement,
              'color-scheme',
              'light'
            );
          }
        }
      });
  }
}
