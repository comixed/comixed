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

package org.comixedproject.plugins.runners;

import static org.junit.Assert.*;

import org.comixedproject.plugins.PluginException;
import org.comixedproject.plugins.interpreters.PluginInterpreter;
import org.comixedproject.plugins.model.Plugin;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class PluginRunnerTest {
  @InjectMocks private PluginRunner pluginRunner;
  @Mock private PluginInterpreter interpreter;
  @Mock private Plugin plugin;

  @Test
  public void testExecute() throws PluginException {
    pluginRunner.execute(interpreter, plugin);

    Mockito.verify(interpreter, Mockito.times(1)).initialize();
    Mockito.verify(interpreter, Mockito.times(1)).start(plugin);
    Mockito.verify(interpreter, Mockito.times(1)).finish();
  }
}
