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

import { PluginTitlePipe } from './plugin-title.pipe';
import { LIBRARY_PLUGIN_4 } from '@app/library-plugins/library-plugins.fixtures';

describe('PluginTitlePipe', () => {
  const PLUGIN = LIBRARY_PLUGIN_4;

  let pipe: PluginTitlePipe;

  beforeEach(() => {
    pipe = new PluginTitlePipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('generates a title from a plugin', () => {
    expect(pipe.transform(PLUGIN)).toEqual(`${PLUGIN.name} v${PLUGIN.version}`);
  });
});
