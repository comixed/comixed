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
import { Observable, Subject } from 'rxjs';
import { AuthenticationAdaptor } from 'app/user/adaptors/authentication.adaptor';

@Injectable()
export class AdminGuard implements CanActivate {
  admin_subject = new Subject<boolean>();
  initialized = false;
  authenticated = false;
  is_admin = false;

  constructor(
    private router: Router,
    private auth_adaptor: AuthenticationAdaptor
  ) {
    this.auth_adaptor.initialized$.subscribe(initialized => {
      this.initialized = initialized;
    });
    this.auth_adaptor.authenticated$.subscribe(authenticated => {
      this.authenticated = authenticated;
    });
    this.auth_adaptor.role$.subscribe(roles => {
      if (this.initialized) {
        this.is_admin = roles.admin;
        this.admin_subject.next(roles.admin);
      }
    });
  }

  canActivate(): Observable<boolean> | Promise<boolean> | boolean {
    if (this.initialized && this.authenticated) {
      return this.is_admin;
    } else {
      if (this.initialized) {
        this.router.navigate(['/home']);
        return false;
      } else {
        this.auth_adaptor.getCurrentUser();
        return this.admin_subject.asObservable();
      }
    }
  }
}
