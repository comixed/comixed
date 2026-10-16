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
import { AppState } from '@app/stores/app-store';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { LoggerService } from '@angular-ru/cdk/logger';
import { RouterLink } from '@angular/router';
import { Button } from '@openng/optimus-ui/button';
import { Toolbar } from '@openng/optimus-ui/toolbar';
import { TranslatePipe } from '@ngx-translate/core';
import { Tooltip } from '@openng/optimus-ui/tooltip';
import { LibraryStatisticsPanel } from '@app/layout/components/library-statistics-panel/library-statistics-panel';
import { Store } from '@ngrx/store';
import {
  selectCurrentUserAuthenticated,
  selectCurrentUserIsAdmin
} from '@app/account/selectors/current-user.selectors';

@Component({
  imports: [
    RouterLink,
    Button,
    Toolbar,
    TranslatePipe,
    Tooltip,
    LibraryStatisticsPanel
  ],
  selector: 'app-topbar',
  styleUrl: './topbar.scss',
  templateUrl: './topbar.html'
})
export class Topbar {
  readonly logger = inject(LoggerService);
  readonly appStore = inject(AppState);
  readonly store = inject(Store);
  readonly authenticated = this.store.selectSignal(
    selectCurrentUserAuthenticated
  );
  readonly isAdmin = this.store.selectSignal(selectCurrentUserIsAdmin);
  readonly renderer = inject(Renderer2);

  constructor() {
    toObservable<boolean>(this.appStore.darkMode)
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
