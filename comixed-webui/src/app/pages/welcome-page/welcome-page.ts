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
import {
  selectAuthenticationUserLoaded,
  selectAuthenticedUser
} from '@app/user/selectors/authentication.selectors';
import { Store } from '@ngrx/store';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  imports: [DatePipe, TranslatePipe],
  selector: 'app-welcome-page',
  styleUrl: './welcome-page.scss',
  templateUrl: './welcome-page.html'
})
export class WelcomePage {
  private store = inject(Store);
  readonly userLoaded = this.store.selectSignal(selectAuthenticationUserLoaded);
  readonly user = this.store.selectSignal(selectAuthenticedUser);
}
