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

import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { LoggerService } from '@angular-ru/logger';
import { selectUser } from '@app/user/selectors/user.selectors';
import { User } from '@app/user/models/user';
import { loadCurrentUser } from '@app/user/actions/user.actions';
import { selectBusyState } from '@app/core/selectors/busy.selectors';
import { TranslateService } from '@ngx-translate/core';
import { loadSessionUpdate } from '@app/actions/session.actions';
import { SESSION_TIMEOUT } from '@app/app.constants';
import { selectUserSessionState } from '@app/selectors/session.selectors';
import { setImportingComicsState } from '@app/library/actions/comic-import.actions';

@Component({
  selector: 'cx-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  user: User = null;
  busy = false;
  sessionActive = false;

  constructor(
    private logger: LoggerService,
    private translateService: TranslateService,
    private store: Store<any>
  ) {
    this.translateService.use('en');
    this.logger.trace('Subscribing to user changes');
    this.store.select(selectUser).subscribe(user => {
      this.logger.debug('User updated:', user);
      this.user = user;
      if (!!this.user && !this.sessionActive) {
        this.logger.debug('Getting first session update');
        this.sessionActive = true;
        this.store.dispatch(
          loadSessionUpdate({ reset: true, timeout: SESSION_TIMEOUT })
        );
      } else if (!this.user && this.sessionActive) {
        this.sessionActive = false;
      }
    });
    this.store
      .select(selectBusyState)
      .subscribe(state => (this.busy = state.enabled));
    this.store.select(selectUserSessionState).subscribe(state => {
      if (!state.loading && state.initialized) {
        this.logger.debug('Session state updated:', state);
        this.store.dispatch(
          setImportingComicsState({ importing: state.importCount !== 0 })
        );
        if (this.sessionActive) {
          this.logger.debug('Getting next session update');
          this.store.dispatch(
            loadSessionUpdate({ reset: false, timeout: SESSION_TIMEOUT })
          );
        }
      }
    });
  }

  ngOnInit(): void {
    this.logger.debug('Loading current user');
    this.store.dispatch(loadCurrentUser());
  }
}
