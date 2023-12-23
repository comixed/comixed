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

package org.comixedproject.rest.plugin;

import static org.junit.Assert.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import org.apache.commons.lang.math.RandomUtils;
import org.comixedproject.model.net.plugin.CreatePluginRequest;
import org.comixedproject.model.net.plugin.UpdatePluginRequest;
import org.comixedproject.model.plugin.LibraryPlugin;
import org.comixedproject.service.plugin.LibraryPluginService;
import org.comixedproject.service.plugin.PluginException;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class LibraryLibraryPluginControllerTest {
  private static final String TEST_USER_EMAIL = "reader@comixedproject.org";
  private static final long TEST_PLUGIN_ID = 129L;
  private static final String TEST_PLUGIN_LANGUAGE = "The libraryPlugin language";
  private static final String TEST_PLUGIN_FILENAME = "The libraryPlugin filename";
  private static final Boolean TEST_ADMIN_ONLY = RandomUtils.nextBoolean();

  @InjectMocks private LibraryPluginController controller;
  @Mock private LibraryPluginService libraryPluginService;
  @Mock private Principal principal;
  @Mock private List<LibraryPlugin> libraryPluginList;
  @Mock private LibraryPlugin libraryPlugin;
  @Mock private LibraryPlugin savedLibraryPlugin;
  @Mock private Map<String, String> pluginProperties;

  @Before
  public void setUp() {
    Mockito.when(principal.getName()).thenReturn(TEST_USER_EMAIL);
  }

  @Test(expected = PluginException.class)
  public void testLoadAllServiceException() throws PluginException {
    Mockito.when(libraryPluginService.getAllPlugins(TEST_USER_EMAIL))
        .thenThrow(PluginException.class);

    try {
      controller.getAllPlugins(principal);
    } finally {
      Mockito.verify(libraryPluginService, Mockito.times(1)).getAllPlugins(TEST_USER_EMAIL);
    }
  }

  @Test
  public void testLoadAll() throws PluginException {
    Mockito.when(libraryPluginService.getAllPlugins(TEST_USER_EMAIL)).thenReturn(libraryPluginList);

    final List<LibraryPlugin> result = controller.getAllPlugins(principal);

    assertNotNull(result);
    assertSame(libraryPluginList, result);

    Mockito.verify(libraryPluginService, Mockito.times(1)).getAllPlugins(TEST_USER_EMAIL);
  }

  @Test(expected = PluginException.class)
  public void testCreatePluginServiceException() throws PluginException {
    Mockito.when(libraryPluginService.createPlugin(Mockito.anyString(), Mockito.anyString()))
        .thenThrow(PluginException.class);

    try {
      controller.createPlugin(new CreatePluginRequest(TEST_PLUGIN_LANGUAGE, TEST_PLUGIN_FILENAME));
    } finally {
      Mockito.verify(libraryPluginService, Mockito.times(1))
          .createPlugin(TEST_PLUGIN_LANGUAGE, TEST_PLUGIN_FILENAME);
    }
  }

  @Test
  public void testCreatePlugin() throws PluginException {
    Mockito.when(libraryPluginService.createPlugin(Mockito.anyString(), Mockito.anyString()))
        .thenReturn(savedLibraryPlugin);

    final LibraryPlugin result =
        controller.createPlugin(
            new CreatePluginRequest(TEST_PLUGIN_LANGUAGE, TEST_PLUGIN_FILENAME));

    assertNotNull(result);
    assertSame(savedLibraryPlugin, result);

    Mockito.verify(libraryPluginService, Mockito.times(1))
        .createPlugin(TEST_PLUGIN_LANGUAGE, TEST_PLUGIN_FILENAME);
  }

  @Test(expected = PluginException.class)
  public void testUpdatePluginServiceException() throws PluginException {
    Mockito.when(
            libraryPluginService.updatePlugin(
                Mockito.anyLong(), Mockito.anyBoolean(), Mockito.anyMap()))
        .thenThrow(PluginException.class);

    try {
      controller.updatePlugin(
          TEST_PLUGIN_ID, new UpdatePluginRequest(TEST_ADMIN_ONLY, pluginProperties));
    } finally {
      Mockito.verify(libraryPluginService, Mockito.times(1))
          .updatePlugin(TEST_PLUGIN_ID, TEST_ADMIN_ONLY, pluginProperties);
    }
  }

  @Test
  public void testUpdatePlugin() throws PluginException {
    Mockito.when(
            libraryPluginService.updatePlugin(
                Mockito.anyLong(), Mockito.anyBoolean(), Mockito.anyMap()))
        .thenReturn(savedLibraryPlugin);

    final LibraryPlugin result =
        controller.updatePlugin(
            TEST_PLUGIN_ID, new UpdatePluginRequest(TEST_ADMIN_ONLY, pluginProperties));

    assertNotNull(result);
    assertSame(savedLibraryPlugin, result);

    Mockito.verify(libraryPluginService, Mockito.times(1))
        .updatePlugin(TEST_PLUGIN_ID, TEST_ADMIN_ONLY, pluginProperties);
  }

  @Test(expected = PluginException.class)
  public void testDeletePluginServiceException() throws PluginException {
    Mockito.doThrow(PluginException.class)
        .when(libraryPluginService)
        .deletePlugin(Mockito.anyLong());

    try {
      controller.deletePlugin(TEST_PLUGIN_ID);
    } finally {
      Mockito.verify(libraryPluginService, Mockito.times(1)).deletePlugin(TEST_PLUGIN_ID);
    }
  }

  @Test
  public void testDeletePlugin() throws PluginException {
    controller.deletePlugin(TEST_PLUGIN_ID);

    Mockito.verify(libraryPluginService, Mockito.times(1)).deletePlugin(TEST_PLUGIN_ID);
  }
}
