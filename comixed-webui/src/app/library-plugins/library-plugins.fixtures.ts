/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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

import { LibraryPlugin } from '@app/library-plugins/models/library-plugin';
import { PluginLanguage } from '@app/library-plugins/models/plugin-language';

export const LIBRARY_PLUGIN_1: LibraryPlugin = {
  id: 1,
  name: 'Plugin 1',
  version: '1.2.3',
  language: 'Groovy',
  adminOnly: false,
  filename: 'plugin1.cxplugin',
  properties: [
    {
      name: 'PROPERTY1',
      value: 'VALUE1',
      length: 24,
      required: true,
      defaultValue: ''
    }
  ]
};

export const LIBRARY_PLUGIN_2: LibraryPlugin = {
  id: 2,
  name: 'Plugin 2',
  version: '1.2.3',
  language: 'Groovy',
  adminOnly: false,
  filename: 'plugin2.cxplugin',
  properties: [
    {
      name: 'PROPERTY2',
      value: 'VALUE2',
      length: 24,
      required: true,
      defaultValue: ''
    }
  ]
};

export const LIBRARY_PLUGIN_3: LibraryPlugin = {
  id: 3,
  name: 'Plugin 3',
  version: '1.2.3',
  language: 'Groovy',
  adminOnly: false,
  filename: 'plugin3.cxplugin',
  properties: [
    {
      name: 'PROPERTY3',
      value: 'VALUE3',
      length: 24,
      required: true,
      defaultValue: ''
    }
  ]
};

export const LIBRARY_PLUGIN_4: LibraryPlugin = {
  id: 4,
  name: 'Plugin 4',
  version: '1.2.3',
  language: 'Groovy',
  adminOnly: false,
  filename: 'plugin4.cxplugin',
  properties: [
    {
      name: 'PROPERTY4.1',
      value: 'VALUE4.1',
      length: 24,
      required: true,
      defaultValue: ''
    },
    {
      name: 'PROPERTY4.2',
      value: 'VALUE4.2',
      length: 24,
      required: false,
      defaultValue: ''
    }
  ]
};

export const LIBRARY_PLUGIN_5: LibraryPlugin = {
  id: 5,
  name: 'Plugin 5',
  version: '1.2.3',
  language: 'Groovy',
  adminOnly: false,
  filename: 'plugin5.cxplugin',
  properties: [
    {
      name: 'PROPERTY5',
      value: 'VALUE5',
      length: 24,
      required: true,
      defaultValue: ''
    }
  ]
};

export const PLUGIN_LIST = [
  LIBRARY_PLUGIN_1,
  LIBRARY_PLUGIN_2,
  LIBRARY_PLUGIN_3,
  LIBRARY_PLUGIN_4,
  LIBRARY_PLUGIN_5
];

export const PLUGIN_LANGUAGE_1: PluginLanguage = { name: 'groovy' };

export const PLUGIN_LANGUAGE_LIST = [PLUGIN_LANGUAGE_1];
