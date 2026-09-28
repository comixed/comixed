/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2024, The ComiXed Project
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

import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Observable } from 'rxjs';
import { interpolate } from '@app/core';
import {
  ADD_ALL_DUPLICATE_HASHES_SELECTION_URL,
  ADD_HASH_SELECTION_URL,
  CLEAR_HASH_SELECTION_URL,
  LOAD_HASH_SELECTIONS_URL,
  REMOVE_HASH_SELECTION_URL
} from '@app/comic-pages/comic-pages.constants';

@Injectable({
  providedIn: 'root'
})
export class HashSelectionService {
  logger = inject(LoggerService);
  http = inject(HttpClient);

  loadSelections(): Observable<any> {
    this.logger.trace('Loading all hash selections');
    return this.http.get(interpolate(LOAD_HASH_SELECTIONS_URL));
  }

  selectAll(): Observable<any> {
    this.logger.trace('Selecting all duplicate page hashes');
    return this.http.post(
      interpolate(ADD_ALL_DUPLICATE_HASHES_SELECTION_URL),
      {}
    );
  }

  addSelection(args: { hash: string }): Observable<any> {
    this.logger.trace('Adding hash selection:', args);
    return this.http.post(
      interpolate(ADD_HASH_SELECTION_URL, { hash: args.hash }),
      {}
    );
  }

  removeSelection(args: { hash: string }): Observable<any> {
    this.logger.trace('Removing hash selection:', args);
    return this.http.put(
      interpolate(REMOVE_HASH_SELECTION_URL, { hash: args.hash }),
      {}
    );
  }

  clearSelections(): Observable<any> {
    this.logger.trace('Clearing hash selections');
    return this.http.delete(interpolate(CLEAR_HASH_SELECTION_URL), {});
  }
}
