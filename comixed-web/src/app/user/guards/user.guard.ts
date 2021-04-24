/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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

import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { LoggerService } from '@angular-ru/logger';
import { Store } from '@ngrx/store';
import { selectUserState } from '@app/user/selectors/user.selectors';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserGuard implements CanActivate {
  initialized = false;
  authenticated = false;
  hasUser = false;
  delayed$ = new Subject<boolean>();

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private router: Router
  ) {
    this.store
      .select(selectUserState)
      .pipe(filter(state => !!state && !state.initializing))
      .subscribe(state => {
        this.initialized = true;
        this.logger.debug('Guard: user state updated:', state);
        this.authenticated = state.authenticated;
        this.delayed$.next(this.authenticated);
        if (!this.authenticated) {
          this.router.navigateByUrl('/login');
        }
      });
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    if (this.initialized) {
      return this.authenticated;
    } else {
      return this.delayed$.asObservable();
    }
  }
}
