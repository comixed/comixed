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

import static org.comixedproject.service.plugin.LibraryPluginService.*;
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
import org.comixedproject.service.comicbooks.ComicBookService;
import org.comixedproject.service.lists.ReadingListService;
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
  private static final String TEST_LANGUAGE = "The Plugin langauge";
  private static final String TEST_PLUGIN_FILENAME = "The Plugin filename";
  private static final String TEST_PLUGIN_NAME = "The Plugin Name";
  private static final String TEST_PLUGIN_VERSION = "1.2.3.4";
  private static final String TEST_UNKNOWN_PROPERTY_NAME = "unknown_property_name";
  private static final String TEST_PROPERTY_NAME = "property_name";
  private static final Integer TEST_PROPERTY_LENGTH = Math.abs(RandomUtils.nextInt());
  private static final String TEST_PROPERTY_VALUE = "The Plugin value";
  private static final Long TEST_PLUGIN_ID = 320L;
  private static final boolean TEST_ADMIN_ONLY = RandomUtils.nextBoolean();

  @InjectMocks private LibraryPluginService service;
  @Mock private LibraryPluginRepository libraryPluginRepository;
  @Mock private UserService userService;
  @Mock private PluginRuntimeRegistry pluginRuntimeRegistry;
  @Mock private ComicBookService comicBookService;
  @Mock private ReadingListService readingListService;
  @Mock private ComiXedUser user;
  @Mock private LibraryPlugin libraryPlugin;
  @Mock private LibraryPlugin savedLibraryPlugin;
  @Mock private LibraryPlugin adminOnlyPlugin;
  @Mock private PluginRuntime pluginRuntime;
  @Mock private LibraryPluginProperty libraryPluginProperty;

  @Captor private ArgumentCaptor<LibraryPlugin> saveArgumentCaptor;

  private List<LibraryPlugin> libraryPluginList = new ArrayList<>();
  private List<LibraryPluginProperty> pluginProperties = new ArrayList<>();
  private Map<String, String> pluginPropertyMap = new HashMap<>();
  private List<LibraryPluginProperty> libraryPluginPropertyList = new ArrayList<>();
  private List<Long> comicBookIdList = new ArrayList<>();

  @Before
  public void setUp() throws ComiXedUserException, PluginRuntimeException {
    Mockito.when(userService.findByEmail(Mockito.anyString())).thenReturn(user);

    Mockito.when(libraryPlugin.getLanguage()).thenReturn(TEST_LANGUAGE);
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
    Mockito.when(libraryPluginProperty.getName()).thenReturn(TEST_PROPERTY_NAME);
    pluginProperties.add(libraryPluginProperty);
    Mockito.when(pluginRuntime.getProperties(Mockito.anyString())).thenReturn(pluginProperties);

    libraryPluginPropertyList.add(libraryPluginProperty);
    Mockito.when(libraryPlugin.getProperties()).thenReturn(libraryPluginPropertyList);
    Mockito.when(libraryPluginRepository.getById(Mockito.anyLong())).thenReturn(libraryPlugin);

    pluginPropertyMap.put(TEST_PROPERTY_NAME, TEST_PROPERTY_VALUE);
    pluginPropertyMap.put(TEST_UNKNOWN_PROPERTY_NAME, TEST_PROPERTY_VALUE);
  }

  @Test(expected = LibraryPluginException.class)
  public void testGetAllNoSuchUser() throws LibraryPluginException, ComiXedUserException {
    Mockito.when(userService.findByEmail(Mockito.anyString()))
        .thenThrow(ComiXedUserException.class);

    try {
      service.getAllPlugins(TEST_EMAIL);
    } finally {
      Mockito.verify(userService, Mockito.times(1)).findByEmail(TEST_EMAIL);
    }
  }

  @Test
  public void testGetAllForReader() throws LibraryPluginException, ComiXedUserException {
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
  public void testGetAllForAdmin() throws LibraryPluginException, ComiXedUserException {
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

  @Test(expected = LibraryPluginException.class)
  public void testCreatePluginNoSuchLanguage()
      throws LibraryPluginException, PluginRuntimeException {
    Mockito.when(pluginRuntimeRegistry.getPluginRuntime(Mockito.anyString()))
        .thenThrow(PluginRuntimeException.class);

    try {
      service.createPlugin(TEST_LANGUAGE, TEST_PLUGIN_FILENAME);
    } finally {
      Mockito.verify(libraryPluginRepository, Mockito.never()).save(Mockito.any());
    }
  }

  @Test(expected = LibraryPluginException.class)
  public void testCreatePluginConstraintViolation() throws LibraryPluginException {
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
  public void testCreatePlugin() throws LibraryPluginException, PluginRuntimeException {
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
    assertTrue(record.getProperties().contains(libraryPluginProperty));

    Mockito.verify(libraryPluginRepository, Mockito.times(1)).save(record);
  }

  @Test(expected = LibraryPluginException.class)
  public void testUpdatePluginNoSuchPlugin() throws LibraryPluginException {
    Mockito.when(libraryPluginRepository.getById(Mockito.anyLong())).thenReturn(null);

    try {
      service.updatePlugin(TEST_PLUGIN_ID, TEST_ADMIN_ONLY, pluginPropertyMap);
    } finally {
      Mockito.verify(libraryPluginRepository, Mockito.times(1)).getById(TEST_PLUGIN_ID);
    }
  }

  @Test
  public void testUpdatePlugin() throws LibraryPluginException {
    final LibraryPlugin result =
        service.updatePlugin(TEST_PLUGIN_ID, TEST_ADMIN_ONLY, pluginPropertyMap);

    assertNotNull(result);
    assertSame(savedLibraryPlugin, result);

    final LibraryPlugin updatedLibraryPlugin = saveArgumentCaptor.getValue();
    assertNotNull(updatedLibraryPlugin);
    assertEquals(1, libraryPluginPropertyList.size());

    Mockito.verify(libraryPluginPropertyList.get(0), Mockito.times(1))
        .setValue(TEST_PROPERTY_VALUE);
    Mockito.verify(updatedLibraryPlugin, Mockito.times(1)).setAdminOnly(TEST_ADMIN_ONLY);
    Mockito.verify(libraryPluginRepository, Mockito.times(1)).getById(TEST_PLUGIN_ID);
  }

  @Test(expected = LibraryPluginException.class)
  public void testDeletePluginNoSuchPlugin() throws LibraryPluginException {
    Mockito.when(libraryPluginRepository.getById(Mockito.anyLong())).thenReturn(null);

    try {
      service.deletePlugin(TEST_PLUGIN_ID);
    } finally {
      Mockito.verify(libraryPluginRepository, Mockito.times(1)).getById(TEST_PLUGIN_ID);
    }
  }

  @Test
  public void testDeletePlugin() throws LibraryPluginException {
    service.deletePlugin(TEST_PLUGIN_ID);

    Mockito.verify(libraryPluginRepository, Mockito.times(1)).getById(TEST_PLUGIN_ID);
    Mockito.verify(libraryPluginRepository, Mockito.times(1)).delete(libraryPlugin);
  }

  @Test(expected = LibraryPluginException.class)
  public void testRunLibraryPluginNoSuchPlugin() throws LibraryPluginException {
    Mockito.when(libraryPluginRepository.getById(Mockito.anyLong())).thenReturn(null);

    try {
      service.runLibraryPlugin(TEST_PLUGIN_ID, comicBookIdList);
    } finally {
      Mockito.verify(libraryPluginRepository, Mockito.times(1)).getById(TEST_PLUGIN_ID);
    }
  }

  @Test(expected = LibraryPluginException.class)
  public void testRunLibraryPluginCouldNotLoad()
      throws LibraryPluginException, PluginRuntimeException {
    Mockito.when(pluginRuntimeRegistry.getPluginRuntime(Mockito.anyString()))
        .thenThrow(PluginRuntimeException.class);

    try {
      service.runLibraryPlugin(TEST_PLUGIN_ID, comicBookIdList);
    } finally {
      Mockito.verify(libraryPluginRepository, Mockito.times(1)).getById(TEST_PLUGIN_ID);
      Mockito.verify(pluginRuntimeRegistry, Mockito.times(1)).getPluginRuntime(TEST_LANGUAGE);
    }
  }

  @Test
  public void testRunLibraryPlugin() throws LibraryPluginException, PluginRuntimeException {
    service.runLibraryPlugin(TEST_PLUGIN_ID, comicBookIdList);

    Mockito.verify(libraryPluginRepository, Mockito.times(1)).getById(TEST_PLUGIN_ID);
    Mockito.verify(pluginRuntimeRegistry, Mockito.times(1)).getPluginRuntime(TEST_LANGUAGE);
    Mockito.verify(pluginRuntime, Mockito.times(1))
        .addProperty(Mockito.eq(PROPERTY_NAME_LOG), Mockito.any());
    Mockito.verify(pluginRuntime, Mockito.times(1))
        .addProperty(PROPERTY_NAME_COMIC_BOOK_SERVICE, comicBookService);
    Mockito.verify(pluginRuntime, Mockito.times(1))
        .addProperty(PROPERTY_NAME_READING_LIST_SERVICE, readingListService);
  }
}
