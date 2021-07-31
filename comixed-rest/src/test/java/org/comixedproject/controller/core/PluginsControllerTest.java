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

package org.comixedproject.controller.core;

import static junit.framework.TestCase.assertNotNull;
import static junit.framework.TestCase.assertSame;

import java.util.List;
import org.comixedproject.plugins.PluginException;
import org.comixedproject.plugins.PluginManager;
import org.comixedproject.plugins.model.PluginDescriptor;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class PluginsControllerTest {
  @InjectMocks private PluginsController pluginsController;
  @Mock private PluginManager pluginManager;
  @Mock private List<PluginDescriptor> pluginList;

  @Test
  public void testGetListOfPlugins() {
    Mockito.when(pluginManager.getPluginList()).thenReturn(pluginList);

    List<PluginDescriptor> result = pluginsController.getList();

    assertNotNull(result);
    assertSame(pluginList, result);
  }

  @Test
  public void testReloadPlugins() throws PluginException {
    Mockito.doNothing().when(pluginManager).loadPlugins();
    Mockito.when(pluginManager.getPluginList()).thenReturn(pluginList);

    final List<PluginDescriptor> result = pluginsController.reloadPlugins();

    assertNotNull(result);
    assertSame(pluginList, result);

    Mockito.verify(pluginManager, Mockito.times(1)).loadPlugins();
    Mockito.verify(pluginManager, Mockito.times(1)).getPluginList();
  }
}
