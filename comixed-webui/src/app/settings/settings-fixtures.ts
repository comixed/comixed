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

import { ConfigurationOption } from '@app/settings/models/configuration-option';
import { MetadataSource } from '@app/settings/models/metadata-source';

export const TEST_CONFIGURATION_OPTIONS_1: ConfigurationOption = {
  name: 'settings1.name',
  value: 'settings1.value'
};

export const TEST_CONFIGURATION_OPTIONS_2: ConfigurationOption = {
  name: 'settings2.name',
  value: 'settings2.value'
};

export const METADATA_SOURCE_1: MetadataSource = {
  metadataSourceId: 3000,
  name: 'The Metadata Source',
  version: '1.0.1',
  available: true,
  homepage: 'http://the-metadata-source',
  preferred: false,
  properties: [{ name: 'metadata-source.property-1', value: 'something' }]
};

export const METADATA_SOURCE_2: MetadataSource = {
  metadataSourceId: 3001,
  name: 'The Other Metadata Source',
  version: '1.0.2',
  available: true,
  homepage: 'http://the-metadata-source',
  preferred: false,
  properties: [{ name: 'metadata-source.property-1', value: 'something else' }]
};
