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

import { Component, inject, signal } from '@angular/core';
import { LibraryStatisticsPanel } from '@app/layout/components/library-statistics-panel/library-statistics-panel';
import {
  selectUserAuthenticated,
  selectUserIsAdmin
} from '@app/account/selectors/user.selectors';
import { Store } from '@ngrx/store';
import { Toolbar } from '@openng/optimus-ui/toolbar';
import packageJson from '../../../../../package.json';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  imports: [LibraryStatisticsPanel, Toolbar, TranslatePipe],
  selector: 'app-footer',
  styleUrl: './footer.scss',
  templateUrl: './footer.html'
})
export class Footer {
  readonly store = inject(Store);
  readonly authenticated = this.store.selectSignal(selectUserAuthenticated);
  readonly isAdmin = this.store.selectSignal(selectUserIsAdmin);
  readonly version = signal(packageJson.version);
}
