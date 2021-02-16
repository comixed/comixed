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
import { LoggerService } from '@angular-ru/logger';
import { HttpClient } from '@angular/common/http';
import { Page } from '@app/library';
import { Observable } from 'rxjs';
import { interpolate } from '@app/core';
import { AddBlockedPageRequest } from '@app/library/models/net/add-blocked-page-request';
import {
  CLEAR_BLOCKED_PAGE_HASH_URL,
  SET_BLOCKED_PAGE_HASH_URL
} from '@app/blocked-page/blocked-page.constants';

@Injectable({
  providedIn: 'root'
})
export class BlockedPageService {
  constructor(private logger: LoggerService, private http: HttpClient) {}

  /**
   * Sets or clears the blacked state for a page's hsah.
   *
   * @param args.page the page
   * @param args.blocked the blocked state
   */
  setBlockedState(args: { page: Page; blocked: boolean }): Observable<any> {
    if (args.blocked) {
      this.logger.debug('Service: setting blocked page state:', args);
      return this.http.post(interpolate(SET_BLOCKED_PAGE_HASH_URL), {
        hash: args.page.hash
      } as AddBlockedPageRequest);
    } else {
      this.logger.debug('Service: clearing blocked page state:', args);
      return this.http.delete(
        interpolate(CLEAR_BLOCKED_PAGE_HASH_URL, { hash: args.page.hash })
      );
    }
  }
}
