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

import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
  METADATA_FEATURE_KEY,
  MetadataState
} from '../reducers/metadata.reducer';

/** Selects for the feature state. */
export const selectMetadataState =
  createFeatureSelector<MetadataState>(METADATA_FEATURE_KEY);

/** Selects for the scraping volumes. */
export const selectVolumeMetadata = createSelector(
  selectMetadataState,
  state => state.volumes
);

/** Selects for the scraping issue. */
export const selectIssueMetadata = createSelector(
  selectMetadataState,
  state => state.scrapingIssue
);

export const selectChosenMetadataSource = createSelector(
  selectMetadataState,
  state => state.metadataSource
);
