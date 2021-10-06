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

import { createReducer, on } from '@ngrx/store';
import {
  metadataScrapedFromFilename,
  resetScrapedMetadata,
  scrapeMetadataFromFilename,
  scrapeMetadataFromFilenameFailed
} from '@app/comic-files/actions/scrape-metadata.actions';

export const SCRAPE_METADATA_FEATURE_KEY = 'scrape_metadata_state';

export interface ScrapeMetadataState {
  busy: boolean;
  found: boolean;
  series: string;
  volume: string;
  issueNumber: string;
}

export const initialState: ScrapeMetadataState = {
  busy: false,
  found: false,
  series: '',
  volume: '',
  issueNumber: ''
};

export const reducer = createReducer(
  initialState,

  on(resetScrapedMetadata, state => ({
    ...state,
    found: false,
    series: '',
    volume: '',
    issueNumber: ''
  })),
  on(scrapeMetadataFromFilename, state => ({
    ...state,
    busy: true
  })),
  on(metadataScrapedFromFilename, (state, action) => ({
    ...state,
    busy: false,
    found: action.found,
    series: action.series,
    volume: action.volume,
    issueNumber: action.issueNumber
  })),
  on(scrapeMetadataFromFilenameFailed, state => ({
    ...state,
    busy: false,
    found: false
  }))
);
