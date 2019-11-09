/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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

import { Action } from '@ngrx/store';
import { BuildDetails } from 'app/backend-status/models/build-details';

export enum BuildDetailsActionTypes {
  GetBuildDetails = '[BUILD] Get the build details',
  BuildDetailsReceived = '[BUILD] Got the build details',
  GetBuildDetailsFailed = '[BUILD] Failed to get the build details'
}

export class BuildDetailsGet implements Action {
  readonly type = BuildDetailsActionTypes.GetBuildDetails;

  constructor() {}
}

export class BuildDetailsReceive implements Action {
  readonly type = BuildDetailsActionTypes.BuildDetailsReceived;

  constructor(public payload: { build_details: BuildDetails }) {}
}

export class BuildDetailsGetFailed implements Action {
  readonly type = BuildDetailsActionTypes.GetBuildDetailsFailed;

  constructor() {}
}

export type BuildDetailsActions =
  | BuildDetailsGet
  | BuildDetailsReceive
  | BuildDetailsGetFailed;
