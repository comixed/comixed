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

import static org.comixedproject.rest.comicbooks.ComicBookSelectionController.LIBRARY_SELECTIONS;
import static org.junit.Assert.*;

import jakarta.servlet.http.HttpSession;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import org.apache.commons.lang.math.RandomUtils;
import org.comixedproject.model.net.plugin.CreatePluginRequest;
import org.comixedproject.model.net.plugin.UpdatePluginRequest;
import org.comixedproject.model.plugin.LibraryPlugin;
import org.comixedproject.service.comicbooks.ComicBookSelectionException;
import org.comixedproject.service.comicbooks.ComicBookSelectionService;
import org.comixedproject.service.plugin.LibraryPluginException;
import org.comixedproject.service.plugin.LibraryPluginService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class LibraryPluginControllerTest {
  private static final String TEST_USER_EMAIL = "reader@comixedproject.org";
  private static final long TEST_PLUGIN_ID = 129L;
  private static final String TEST_PLUGIN_LANGUAGE = "The libraryPlugin language";
  private static final String TEST_PLUGIN_FILENAME = "The libraryPlugin filename";
  private static final Boolean TEST_ADMIN_ONLY = RandomUtils.nextBoolean();
  private static final Long TEST_COMIC_BOOK_ID = 320L;
  private static final String TEST_ENCODED_IDS = "The encoded selected ids";
  private static final String TEST_REENCODED_IDS = "The re-encoded selected ids";

  @InjectMocks private LibraryPluginController controller;
  @Mock private LibraryPluginService libraryPluginService;
  @Mock private ComicBookSelectionService comicBookSelectionService;
  @Mock private Principal principal;
  @Mock private List<LibraryPlugin> libraryPluginList;
  @Mock private LibraryPlugin libraryPlugin;
  @Mock private LibraryPlugin savedLibraryPlugin;
  @Mock private Map<String, String> pluginProperties;
  @Mock private HttpSession session;
  @Mock private List selectedIds;

  @Captor private ArgumentCaptor<List<Long>> idListArgumentCaptor;

  @Before
  public void setUp() throws ComicBookSelectionException {
    Mockito.when(principal.getName()).thenReturn(TEST_USER_EMAIL);
    Mockito.when(session.getAttribute(LIBRARY_SELECTIONS)).thenReturn(TEST_ENCODED_IDS);
    Mockito.when(comicBookSelectionService.decodeSelections(TEST_ENCODED_IDS))
        .thenReturn(selectedIds);
    Mockito.when(comicBookSelectionService.encodeSelections(Mockito.anyList()))
        .thenReturn(TEST_REENCODED_IDS);
  }

  @Test(expected = LibraryPluginException.class)
  public void testLoadAllServiceException() throws LibraryPluginException {
    Mockito.when(libraryPluginService.getAllPlugins(TEST_USER_EMAIL))
        .thenThrow(LibraryPluginException.class);

    try {
      controller.getAllPlugins(principal);
    } finally {
      Mockito.verify(libraryPluginService, Mockito.times(1)).getAllPlugins(TEST_USER_EMAIL);
    }
  }

  @Test
  public void testLoadAll() throws LibraryPluginException {
    Mockito.when(libraryPluginService.getAllPlugins(TEST_USER_EMAIL)).thenReturn(libraryPluginList);

    final List<LibraryPlugin> result = controller.getAllPlugins(principal);

    assertNotNull(result);
    assertSame(libraryPluginList, result);

    Mockito.verify(libraryPluginService, Mockito.times(1)).getAllPlugins(TEST_USER_EMAIL);
  }

  @Test(expected = LibraryPluginException.class)
  public void testCreatePluginServiceException() throws LibraryPluginException {
    Mockito.when(libraryPluginService.createPlugin(Mockito.anyString(), Mockito.anyString()))
        .thenThrow(LibraryPluginException.class);

    try {
      controller.createPlugin(new CreatePluginRequest(TEST_PLUGIN_LANGUAGE, TEST_PLUGIN_FILENAME));
    } finally {
      Mockito.verify(libraryPluginService, Mockito.times(1))
          .createPlugin(TEST_PLUGIN_LANGUAGE, TEST_PLUGIN_FILENAME);
    }
  }

  @Test
  public void testCreatePlugin() throws LibraryPluginException {
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

  @Test(expected = LibraryPluginException.class)
  public void testUpdatePluginServiceException() throws LibraryPluginException {
    Mockito.when(
            libraryPluginService.updatePlugin(
                Mockito.anyLong(), Mockito.anyBoolean(), Mockito.anyMap()))
        .thenThrow(LibraryPluginException.class);

    try {
      controller.updatePlugin(
          TEST_PLUGIN_ID, new UpdatePluginRequest(TEST_ADMIN_ONLY, pluginProperties));
    } finally {
      Mockito.verify(libraryPluginService, Mockito.times(1))
          .updatePlugin(TEST_PLUGIN_ID, TEST_ADMIN_ONLY, pluginProperties);
    }
  }

  @Test
  public void testUpdatePlugin() throws LibraryPluginException {
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

  @Test(expected = LibraryPluginException.class)
  public void testDeletePluginServiceException() throws LibraryPluginException {
    Mockito.doThrow(LibraryPluginException.class)
        .when(libraryPluginService)
        .deletePlugin(Mockito.anyLong());

    try {
      controller.deletePlugin(TEST_PLUGIN_ID);
    } finally {
      Mockito.verify(libraryPluginService, Mockito.times(1)).deletePlugin(TEST_PLUGIN_ID);
    }
  }

  @Test
  public void testDeletePlugin() throws LibraryPluginException {
    controller.deletePlugin(TEST_PLUGIN_ID);

    Mockito.verify(libraryPluginService, Mockito.times(1)).deletePlugin(TEST_PLUGIN_ID);
  }

  @Test(expected = LibraryPluginException.class)
  public void testRunLibraryPluginOnOneComicServiceException() throws LibraryPluginException {
    Mockito.doThrow(LibraryPluginException.class)
        .when(libraryPluginService)
        .runLibraryPlugin(Mockito.anyLong(), idListArgumentCaptor.capture());

    try {
      controller.runLibraryPluginOnOneComicBook(TEST_PLUGIN_ID, TEST_COMIC_BOOK_ID);
    } finally {
      final List<Long> idList = idListArgumentCaptor.getValue();

      assertNotNull(idList);
      assertFalse(idList.isEmpty());
      assertEquals(1, idList.size());
      assertTrue(idList.contains(TEST_COMIC_BOOK_ID));

      Mockito.verify(libraryPluginService, Mockito.times(1))
          .runLibraryPlugin(TEST_PLUGIN_ID, idList);
    }
  }

  @Test
  public void testRunLibraryPluginOnOneComic() throws LibraryPluginException {
    Mockito.doNothing()
        .when(libraryPluginService)
        .runLibraryPlugin(Mockito.anyLong(), idListArgumentCaptor.capture());

    controller.runLibraryPluginOnOneComicBook(TEST_PLUGIN_ID, TEST_COMIC_BOOK_ID);

    final List<Long> idList = idListArgumentCaptor.getValue();

    assertNotNull(idList);
    assertFalse(idList.isEmpty());
    assertEquals(1, idList.size());
    assertTrue(idList.contains(TEST_COMIC_BOOK_ID));

    Mockito.verify(libraryPluginService, Mockito.times(1)).runLibraryPlugin(TEST_PLUGIN_ID, idList);
  }

  @Test(expected = LibraryPluginException.class)
  public void testRunLibraryPluginOnSelectedComicBooksSelectionDecodingException()
      throws LibraryPluginException, ComicBookSelectionException {
    Mockito.when(comicBookSelectionService.decodeSelections(TEST_ENCODED_IDS))
        .thenThrow(ComicBookSelectionException.class);

    try {
      controller.runLibraryPluginOnSelectedComicBooks(session, TEST_PLUGIN_ID);
    } finally {
      Mockito.verify(libraryPluginService, Mockito.never())
          .runLibraryPlugin(Mockito.anyLong(), Mockito.anyList());
    }
  }

  @Test(expected = LibraryPluginException.class)
  public void testRunLibraryPluginOnSelectedComicBooksServiceException()
      throws LibraryPluginException {
    Mockito.doThrow(LibraryPluginException.class)
        .when(libraryPluginService)
        .runLibraryPlugin(Mockito.anyLong(), Mockito.anyList());

    try {
      controller.runLibraryPluginOnSelectedComicBooks(session, TEST_PLUGIN_ID);
    } finally {
      Mockito.verify(libraryPluginService, Mockito.times(1))
          .runLibraryPlugin(TEST_PLUGIN_ID, selectedIds);
      Mockito.verify(comicBookSelectionService, Mockito.never())
          .clearSelectedComicBooks(Mockito.anyList());
    }
  }

  @Test
  public void testRunLibraryPluginOnSelectedComicBooks() throws LibraryPluginException {
    controller.runLibraryPluginOnSelectedComicBooks(session, TEST_PLUGIN_ID);

    Mockito.verify(libraryPluginService, Mockito.times(1))
        .runLibraryPlugin(TEST_PLUGIN_ID, selectedIds);
    Mockito.verify(comicBookSelectionService, Mockito.times(1))
        .clearSelectedComicBooks(selectedIds);
  }
}
