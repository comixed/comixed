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

import { inject, Service } from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  MARK_SELECTED_COMICS_READ_STATE_URL,
  UNMARK_SELECTED_COMICS_READ_STATE_URL
} from '@app/account/account-constants';
import { interpolate } from '@app/app-functions';

@Service()
export class ReadComicService {
  readonly logger = inject(LoggerService);
  readonly http = inject(HttpClient);

  markSelectedComics(args: { readState: boolean }): Observable<void> {
    if (args.readState) {
      return this.http.put<void>(
        interpolate(MARK_SELECTED_COMICS_READ_STATE_URL),
        {} as unknown
      );
    } else {
      return this.http.delete<void>(
        interpolate(UNMARK_SELECTED_COMICS_READ_STATE_URL)
      );
    }
  }
}
