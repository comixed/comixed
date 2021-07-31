/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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
import { isReader } from '@app/user/user.functions';

@Injectable({
  providedIn: 'root'
})
export class ReaderGuard implements CanActivate {
  authenticated = false;
  isReader = false;
  delayed$ = new Subject<boolean>();

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private router: Router
  ) {
    this.store
      .select(selectUserState)
      .pipe(filter(state => !!state))
      .subscribe(state => {
        this.logger.debug('Guard: user state updated:', state);
        this.authenticated = state.authenticated;
        const user = state.user;
        if (this.authenticated) {
          this.isReader = false;
          if (!user) {
            this.router.navigateByUrl('/login');
          } else {
            this.isReader = isReader(user);
            this.delayed$.next(this.isReader);
            if (!this.isReader) {
              this.router.navigateByUrl('/');
            }
          }
        }
      });
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    if (this.authenticated) {
      return this.isReader;
    } else {
      return this.delayed$.asObservable();
    }
  }
}
