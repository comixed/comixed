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

package org.comixed.plugins;

import static junit.framework.TestCase.*;

import java.io.File;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;
import org.comixed.plugins.model.Plugin;
import org.comixed.utils.FileTypeIdentifier;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.beans.factory.ObjectFactory;

@RunWith(MockitoJUnitRunner.class)
public class PluginManagerTest {
  private static final String TEST_UNDEFINED_PLUGIN_NAME = "plugin-doesnt-exist";
  private static final String TEST_PLUGIN_NAME = "test-plugin";
  private static final Map<String, byte[]> TEST_PLUGIN_ENTRIES = new HashMap<>();
  private static final String TEST_EXAMPLE_PLUGIN_FILE = "src/test/resources/example-plugin.cxp";

  static {
    TEST_PLUGIN_ENTRIES.put(
        Plugin.MANIFEST_FILENAME,
        ("# this is a test manifest\n" + (Plugin.PLUGIN_NAME + ": " + TEST_PLUGIN_NAME + "\n"))
            .getBytes());
  }

  @InjectMocks private PluginManager pluginManager;
  @Mock private ObjectFactory<Plugin> pluginObjectFactory;
  @Mock private Plugin plugin;
  @Mock private FileTypeIdentifier fileTypeIdentifier;
  @Captor private ArgumentCaptor<InputStream> inputStreamArgumentCaptor;

  @Test(expected = PluginException.class)
  public void testLoadPluginNotDefined() throws PluginException {
    pluginManager.loadPlugin(TEST_UNDEFINED_PLUGIN_NAME);
  }

  @Test
  public void testLoadPlugin() throws PluginException {
    pluginManager.plugins.put(TEST_PLUGIN_NAME, TEST_PLUGIN_ENTRIES);

    Mockito.when(pluginObjectFactory.getObject()).thenReturn(plugin);
    Mockito.doNothing().when(plugin).setEntries(Mockito.anyMap());

    Plugin result = pluginManager.loadPlugin(TEST_PLUGIN_NAME);

    assertNotNull(result);
    assertSame(plugin, result);

    Mockito.verify(pluginObjectFactory, Mockito.times(1)).getObject();
    Mockito.verify(plugin, Mockito.times(1)).setEntries(TEST_PLUGIN_ENTRIES);
  }

  @Test(expected = PluginException.class)
  public void testLoadPluginsPointsToFile() throws PluginException {
    pluginManager.pluginLocation = TEST_EXAMPLE_PLUGIN_FILE;
    pluginManager.loadPlugins();
  }

  @Test
  public void testLoadPluginsNotZipfile() throws PluginException {
    pluginManager.pluginLocation =
        new File(TEST_EXAMPLE_PLUGIN_FILE).getParentFile().getAbsolutePath();

    Mockito.when(fileTypeIdentifier.subtypeFor(inputStreamArgumentCaptor.capture()))
        .thenReturn("7zip");

    pluginManager.loadPlugins();

    assertTrue(pluginManager.plugins.isEmpty());

    Mockito.verify(fileTypeIdentifier, Mockito.times(1))
        .subtypeFor(inputStreamArgumentCaptor.getValue());
  }

  @Test
  public void testLoadPlugins() throws PluginException {
    pluginManager.pluginLocation =
        new File(TEST_EXAMPLE_PLUGIN_FILE).getParentFile().getAbsolutePath();

    Mockito.when(fileTypeIdentifier.subtypeFor(inputStreamArgumentCaptor.capture()))
        .thenReturn("zip");
    Mockito.when(pluginObjectFactory.getObject()).thenReturn(plugin);
    Mockito.doNothing().when(plugin).setEntries(Mockito.anyMap());
    Mockito.when(plugin.getName()).thenReturn(TEST_PLUGIN_NAME);

    pluginManager.loadPlugins();

    assertFalse(pluginManager.plugins.isEmpty());
    assertTrue(pluginManager.plugins.containsKey(TEST_PLUGIN_NAME));

    Mockito.verify(fileTypeIdentifier, Mockito.times(1))
        .subtypeFor(inputStreamArgumentCaptor.getValue());
  }
}
