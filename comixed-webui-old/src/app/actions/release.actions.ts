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

import { createAction, props } from '@ngrx/store';
import { CurrentRelease } from '@app/models/current-release';
import { LatestRelease } from '@app/models/latest-release';

export const loadCurrentReleaseDetails = createAction(
  '[Release] Load the current release details'
);

export const currentReleaseDetailsLoaded = createAction(
  '[Release] Current release details loaded',
  props<{ details: CurrentRelease }>()
);

export const loadCurrentReleaseDetailsFailed = createAction(
  '[Release] Load current release details failed'
);

export const loadLatestReleaseDetails = createAction(
  '[Release] Load the latest release details'
);

export const latestReleaseDetailsLoaded = createAction(
  '[Release] The latest release details are loaded',
  props<{ details: LatestRelease }>()
);

export const loadLatestReleaseDetailsFailed = createAction(
  '[Release] Failed to load the latest release details'
);
