/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import { AuthenticationAdaptor } from 'app/adaptors/authentication.adaptor';
import { AuthenticationState } from 'app/models/state/authentication-state';

@Injectable()
export class AdminGuard implements CanActivate {
  admin_subject = new Subject<boolean>();

  constructor(
    private router: Router,
    private auth_adaptor: AuthenticationAdaptor
  ) {
    this.auth_adaptor.auth_state$.subscribe(
      (auth_state: AuthenticationState) => {
        this.admin_subject.next(
          this.auth_adaptor.authenticated && this.auth_adaptor.is_admin
        );
      }
    );
  }

  canActivate(): Observable<boolean> | Promise<boolean> | boolean {
    // if the user auth check hasn't completed, return a promise
    if (this.auth_adaptor.initialized) {
      if (this.auth_adaptor.authenticated) {
        return this.auth_adaptor.is_admin;
      } else {
        this.router.navigate(['/home']);
        return false;
      }
    } else {
      this.auth_adaptor.get_current_user();
      return this.admin_subject;
    }
  }
}
