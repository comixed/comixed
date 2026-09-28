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

import { Component, effect, inject, Renderer2, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';

@Component({
  imports: [MatIcon, MatIconButton],
  selector: 'app-topbar',
  styleUrl: './topbar.scss',
  templateUrl: './topbar.html'
})
export class Topbar {
  mode = signal('light');

  renderer = inject(Renderer2);

  constructor() {
    /* v8 ignore start */
    effect(() => {
      if (this.mode() == 'dark') {
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
    });
    /* v8 ignore stop */
  }

  onToggleDarkMode() {
    /* v8 ignore start */
    if (this.mode() == 'dark') this.mode.set('light');
    else this.mode.set('dark');
    /* v8 ignore stop */
  }
}
