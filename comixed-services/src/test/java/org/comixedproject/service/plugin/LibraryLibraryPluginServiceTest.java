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

package org.comixedproject.service.plugin;

import static org.junit.Assert.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.apache.commons.lang.math.RandomUtils;
import org.comixedproject.model.plugin.LibraryPlugin;
import org.comixedproject.model.plugin.LibraryPluginProperty;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.plugins.PluginRuntime;
import org.comixedproject.plugins.PluginRuntimeException;
import org.comixedproject.plugins.PluginRuntimeRegistry;
import org.comixedproject.repositories.plugin.LibraryPluginRepository;
import org.comixedproject.service.user.ComiXedUserException;
import org.comixedproject.service.user.UserService;
import org.hibernate.exception.ConstraintViolationException;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class LibraryLibraryPluginServiceTest {
  private static final String TEST_EMAIL = "user@comixedproject.org";
  private static final String TEST_LANGUAGE = "The libraryPlugin langauge";
  private static final String TEST_PLUGIN_FILENAME = "The libraryPlugin filename";
  private static final String TEST_PLUGIN_NAME = "The LibraryPlugin Name";
  private static final String TEST_PLUGIN_VERSION = "1.2.3.4";
  private static final String TEST_UNKNOWN_PROPERTY_NAME = "unknown_property_name";
  private static final String TEST_PROPERTY_NAME = "property_name";
  private static final Integer TEST_PROPERTY_LENGTH = Math.abs(RandomUtils.nextInt());
  private static final String TEST_PROPERTY_VALUE = "The libraryPlugin value";
  private static final Long TEST_PLUGIN_ID = 320L;
  private static final boolean TEST_ADMIN_ONLY = RandomUtils.nextBoolean();

  @InjectMocks private LibraryPluginService service;
  @Mock private LibraryPluginRepository libraryPluginRepository;
  @Mock private UserService userService;
  @Mock private PluginRuntimeRegistry pluginRuntimeRegistry;
  @Mock private ComiXedUser user;
  @Mock private LibraryPlugin libraryPlugin;
  @Mock private LibraryPlugin savedLibraryPlugin;
  @Mock private LibraryPlugin adminOnlyPlugin;
  @Mock private PluginRuntime pluginRuntime;

  @Captor private ArgumentCaptor<LibraryPlugin> saveArgumentCaptor;

  private List<LibraryPlugin> libraryPluginList = new ArrayList<>();
  private Map<String, Integer> pluginProperties = new HashMap<>();
  private Map<String, String> pluginPropertyMap = new HashMap<>();
  private List<LibraryPluginProperty> libraryPluginPropertyList = new ArrayList<>();

  @Before
  public void setUp() throws ComiXedUserException, PluginRuntimeException {
    Mockito.when(userService.findByEmail(Mockito.anyString())).thenReturn(user);

    Mockito.when(libraryPlugin.getAdminOnly()).thenReturn(false);
    libraryPluginList.add(libraryPlugin);
    Mockito.when(adminOnlyPlugin.getAdminOnly()).thenReturn(true);
    libraryPluginList.add(adminOnlyPlugin);

    Mockito.when(libraryPluginRepository.save(saveArgumentCaptor.capture()))
        .thenReturn(savedLibraryPlugin);

    Mockito.when(pluginRuntimeRegistry.getPluginRuntime(Mockito.anyString()))
        .thenReturn(pluginRuntime);

    Mockito.when(pluginRuntime.getName(Mockito.anyString())).thenReturn(TEST_PLUGIN_NAME);
    Mockito.when(pluginRuntime.getVersion(Mockito.anyString())).thenReturn(TEST_PLUGIN_VERSION);
    pluginProperties.put(TEST_PROPERTY_NAME, TEST_PROPERTY_LENGTH);
    Mockito.when(pluginRuntime.getProperties(Mockito.anyString())).thenReturn(pluginProperties);

    libraryPluginPropertyList.add(
        new LibraryPluginProperty(libraryPlugin, TEST_PROPERTY_NAME, TEST_PROPERTY_LENGTH));
    Mockito.when(libraryPlugin.getProperties()).thenReturn(libraryPluginPropertyList);
    Mockito.when(libraryPluginRepository.getById(Mockito.anyLong())).thenReturn(libraryPlugin);

    pluginPropertyMap.put(TEST_PROPERTY_NAME, TEST_PROPERTY_VALUE);
    pluginPropertyMap.put(TEST_UNKNOWN_PROPERTY_NAME, TEST_PROPERTY_VALUE);
  }

  @Test(expected = PluginException.class)
  public void testGetAllNoSuchUser() throws PluginException, ComiXedUserException {
    Mockito.when(userService.findByEmail(Mockito.anyString()))
        .thenThrow(ComiXedUserException.class);

    try {
      service.getAllPlugins(TEST_EMAIL);
    } finally {
      Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_EMAIL);
    }
  }

  @Test
  public void testGetAllForReader() throws PluginException, ComiXedUserException {
    Mockito.when(user.isAdmin()).thenReturn(false);
    Mockito.when(libraryPluginRepository.getAll()).thenReturn(libraryPluginList);

    final List<LibraryPlugin> result = service.getAllPlugins(TEST_EMAIL);

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertEquals(1, result.size());
    assertTrue(result.contains(libraryPlugin));

    Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_EMAIL);
    Mockito.verify(libraryPluginRepository, Mockito.times(1)).getAll();
  }

  @Test
  public void testGetAllForAdmin() throws PluginException, ComiXedUserException {
    Mockito.when(user.isAdmin()).thenReturn(true);
    Mockito.when(libraryPluginRepository.getAll()).thenReturn(libraryPluginList);

    final List<LibraryPlugin> result = service.getAllPlugins(TEST_EMAIL);

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertEquals(2, result.size());
    assertTrue(result.contains(libraryPlugin));
    assertTrue(result.contains(adminOnlyPlugin));

    Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_EMAIL);
    Mockito.verify(libraryPluginRepository, Mockito.times(1)).getAll();
  }

  @Test(expected = PluginException.class)
  public void testCreatePluginNoSuchLanguage() throws PluginException, PluginRuntimeException {
    Mockito.when(pluginRuntimeRegistry.getPluginRuntime(Mockito.anyString()))
        .thenThrow(PluginRuntimeException.class);

    try {
      service.createPlugin(TEST_LANGUAGE, TEST_PLUGIN_FILENAME);
    } finally {
      Mockito.verify(libraryPluginRepository, Mockito.never()).save(Mockito.any());
    }
  }

  @Test(expected = PluginException.class)
  public void testCreatePluginConstraintViolation() throws PluginException {
    Mockito.when(libraryPluginRepository.save(saveArgumentCaptor.capture()))
        .thenThrow(ConstraintViolationException.class);

    try {
      service.createPlugin(TEST_LANGUAGE, TEST_PLUGIN_FILENAME);
    } finally {
      final LibraryPlugin record = saveArgumentCaptor.getValue();

      assertNotNull(record);
      assertEquals(TEST_PLUGIN_FILENAME, record.getFilename());

      Mockito.verify(libraryPluginRepository, Mockito.times(1)).save(record);
    }
  }

  @Test
  public void testCreatePlugin() throws PluginException, PluginRuntimeException {
    final LibraryPlugin result = service.createPlugin(TEST_LANGUAGE, TEST_PLUGIN_FILENAME);

    assertNotNull(result);
    assertSame(savedLibraryPlugin, result);

    final LibraryPlugin record = saveArgumentCaptor.getValue();

    assertNotNull(record);
    assertEquals(TEST_PLUGIN_FILENAME, record.getFilename());
    assertEquals(TEST_PLUGIN_NAME, record.getName());
    assertEquals(TEST_PLUGIN_NAME, record.getUniqueName());
    assertEquals(TEST_PLUGIN_VERSION, record.getVersion());
    assertFalse(record.getProperties().isEmpty());
    assertTrue(
        record
            .getProperties()
            .contains(new LibraryPluginProperty(record, TEST_PROPERTY_NAME, TEST_PROPERTY_LENGTH)));

    Mockito.verify(libraryPluginRepository, Mockito.times(1)).save(record);
  }

  @Test(expected = PluginException.class)
  public void testUpdatePluginNoSuchPlugin() throws PluginException {
    Mockito.when(libraryPluginRepository.getById(Mockito.anyLong())).thenReturn(null);

    try {
      service.updatePlugin(TEST_PLUGIN_ID, TEST_ADMIN_ONLY, pluginPropertyMap);
    } finally {
      Mockito.verify(libraryPluginRepository, Mockito.times(1)).getById(TEST_PLUGIN_ID);
    }
  }

  @Test
  public void testUpdatePlugin() throws PluginException {
    final LibraryPlugin result =
        service.updatePlugin(TEST_PLUGIN_ID, TEST_ADMIN_ONLY, pluginPropertyMap);

    assertNotNull(result);
    assertSame(savedLibraryPlugin, result);

    final LibraryPlugin updatedLibraryPlugin = saveArgumentCaptor.getValue();
    assertNotNull(updatedLibraryPlugin);
    Mockito.verify(updatedLibraryPlugin, Mockito.times(1)).setAdminOnly(TEST_ADMIN_ONLY);
    assertEquals(1, libraryPluginPropertyList.size());
    assertEquals(TEST_PROPERTY_NAME, libraryPluginPropertyList.get(0).getName());
    assertEquals(TEST_PROPERTY_VALUE, libraryPluginPropertyList.get(0).getValue());

    Mockito.verify(libraryPluginRepository, Mockito.times(1)).getById(TEST_PLUGIN_ID);
  }

  @Test(expected = PluginException.class)
  public void testDeletePluginNoSuchPlugin() throws PluginException {
    Mockito.when(libraryPluginRepository.getById(Mockito.anyLong())).thenReturn(null);

    try {
      service.deletePlugin(TEST_PLUGIN_ID);
    } finally {
      Mockito.verify(libraryPluginRepository, Mockito.times(1)).getById(TEST_PLUGIN_ID);
    }
  }

  @Test
  public void testDeletePlugin() throws PluginException {
    service.deletePlugin(TEST_PLUGIN_ID);

    Mockito.verify(libraryPluginRepository, Mockito.times(1)).getById(TEST_PLUGIN_ID);
    Mockito.verify(libraryPluginRepository, Mockito.times(1)).delete(libraryPlugin);
  }
}
