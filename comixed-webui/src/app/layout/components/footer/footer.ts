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
import { LibraryStore } from '@app/library/stores/library-store';
import { TranslatePipe } from '@ngx-translate/core';
import { MatToolbar } from '@angular/material/toolbar';

@Component({
  imports: [TranslatePipe, MatToolbar],
  selector: 'app-footer',
  styleUrl: './footer.scss',
  templateUrl: './footer.html'
})
export class Footer {
  readonly libraryState = inject(LibraryStore);
}
