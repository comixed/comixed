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

import { createAction, props } from '@ngrx/store';
import { Publisher } from '@app/collections/models/publisher';
import { Series } from '@app/collections/models/series';

export const loadPublishers = createAction('[Publishers] Load publishers');

export const publishersLoaded = createAction(
  '[Publishers] Publishers loaded',
  props<{ publishers: Publisher[] }>()
);

export const loadPublishersFailed = createAction(
  '[Publishers] Load publishers failed'
);

export const loadPublisherDetail = createAction(
  '[Publishers] Load the details of a publisher',
  props<{ name: string }>()
);

export const publisherDetailLoaded = createAction(
  '[Publishers] Publisher detail loaded',
  props<{ detail: Series[] }>()
);

export const loadPublisherDetailFailed = createAction(
  '[Publishers] Failed to load the details of a publisher'
);
