/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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
import { ActivatedRoute, Params, Router } from '@angular/router';
import { LoggerService } from '@angular-ru/cdk/logger';
import { PAGE_SIZE_OPTIONS } from '@app/app-constants';

@Injectable({
  providedIn: 'root'
})
export class QueryParameterService {
  readonly pageSizeOptions = PAGE_SIZE_OPTIONS;

  logger = inject(LoggerService);
  activatedRoute = inject(ActivatedRoute);
  router = inject(Router);

  constructor() {
    this.logger.trace('Subscribing to query parameter updates');
    this.activatedRoute.queryParams.subscribe(params => {
      this.logger.debug('Query parameters changed:', params);
    });
  }

  updateQueryParam(params: { name: string; value: string | null }[]): void {
    const queryParams: Params = Object.assign(
      {},
      this.activatedRoute.snapshot.queryParams
    );
    params.forEach(entry => (queryParams[entry.name] = entry.value));
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams
    });
  }
}
