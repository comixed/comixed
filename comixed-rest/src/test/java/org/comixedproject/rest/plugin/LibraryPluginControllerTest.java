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
import org.comixedproject.service.comicbooks.ComicSelectionService;
import org.comixedproject.service.plugin.LibraryPluginException;
import org.comixedproject.service.plugin.LibraryPluginService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class LibraryPluginControllerTest {
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
  @Mock private ComicSelectionService comicSelectionService;
  @Mock private Principal principal;
  @Mock private List<LibraryPlugin> libraryPluginList;
  @Mock private LibraryPlugin libraryPlugin;
  @Mock private LibraryPlugin savedLibraryPlugin;
  @Mock private Map<String, String> pluginProperties;
  @Mock private HttpSession session;
  @Mock private List selectedIds;

  @Captor private ArgumentCaptor<List<Long>> idListArgumentCaptor;

  @BeforeEach
  void setUp() throws ComicBookSelectionException {
    Mockito.when(principal.getName()).thenReturn(TEST_USER_EMAIL);
    Mockito.when(session.getAttribute(LIBRARY_SELECTIONS)).thenReturn(TEST_ENCODED_IDS);
    Mockito.when(comicSelectionService.decodeSelections(TEST_ENCODED_IDS)).thenReturn(selectedIds);
    Mockito.when(comicSelectionService.encodeSelections(Mockito.anyList()))
        .thenReturn(TEST_REENCODED_IDS);
  }

  @Test
  void loadAllServiceException() throws LibraryPluginException {
    Mockito.when(libraryPluginService.getAllPlugins(TEST_USER_EMAIL))
        .thenThrow(LibraryPluginException.class);

    assertThrows(LibraryPluginException.class, () -> controller.getAllPlugins(principal));
  }

  @Test
  void loadAll() throws LibraryPluginException {
    Mockito.when(libraryPluginService.getAllPlugins(TEST_USER_EMAIL)).thenReturn(libraryPluginList);

    final List<LibraryPlugin> result = controller.getAllPlugins(principal);

    assertNotNull(result);
    assertSame(libraryPluginList, result);

    Mockito.verify(libraryPluginService, Mockito.times(1)).getAllPlugins(TEST_USER_EMAIL);
  }

  @Test
  void createPluginServiceException() throws LibraryPluginException {
    Mockito.when(libraryPluginService.createPlugin(Mockito.anyString(), Mockito.anyString()))
        .thenThrow(LibraryPluginException.class);

    assertThrows(
        LibraryPluginException.class,
        () ->
            controller.createPlugin(
                new CreatePluginRequest(TEST_PLUGIN_LANGUAGE, TEST_PLUGIN_FILENAME)));
  }

  @Test
  void createPlugin() throws LibraryPluginException {
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

  @Test
  void updatePluginServiceException() throws LibraryPluginException {
    Mockito.when(
            libraryPluginService.updatePlugin(
                Mockito.anyLong(), Mockito.anyBoolean(), Mockito.anyMap()))
        .thenThrow(LibraryPluginException.class);

    assertThrows(
        LibraryPluginException.class,
        () ->
            controller.updatePlugin(
                TEST_PLUGIN_ID, new UpdatePluginRequest(TEST_ADMIN_ONLY, pluginProperties)));
  }

  @Test
  void updatePlugin() throws LibraryPluginException {
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

  @Test
  void deletePluginServiceException() throws LibraryPluginException {
    Mockito.doThrow(LibraryPluginException.class)
        .when(libraryPluginService)
        .deletePlugin(Mockito.anyLong());

    assertThrows(LibraryPluginException.class, () -> controller.deletePlugin(TEST_PLUGIN_ID));
  }

  @Test
  void deletePlugin() throws LibraryPluginException {
    controller.deletePlugin(TEST_PLUGIN_ID);

    Mockito.verify(libraryPluginService, Mockito.times(1)).deletePlugin(TEST_PLUGIN_ID);
  }

  @Test
  void runLibraryPluginOnOneComicServiceException() throws LibraryPluginException {
    Mockito.doThrow(LibraryPluginException.class)
        .when(libraryPluginService)
        .runLibraryPlugin(Mockito.anyLong(), idListArgumentCaptor.capture());

    assertThrows(
        LibraryPluginException.class,
        () -> controller.runLibraryPluginOnOneComicBook(TEST_PLUGIN_ID, TEST_COMIC_BOOK_ID));
  }

  @Test
  void runLibraryPluginOnOneComic() throws LibraryPluginException {
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

  @Test
  void runLibraryPluginOnSelectedComicBooksSelectionDecodingException()
      throws ComicBookSelectionException {
    Mockito.when(comicSelectionService.decodeSelections(TEST_ENCODED_IDS))
        .thenThrow(ComicBookSelectionException.class);

    assertThrows(
        LibraryPluginException.class,
        () -> controller.runLibraryPluginOnSelectedComicBooks(session, TEST_PLUGIN_ID));
  }

  @Test
  void runLibraryPluginOnSelectedComicBooksServiceException() throws LibraryPluginException {
    Mockito.doThrow(LibraryPluginException.class)
        .when(libraryPluginService)
        .runLibraryPlugin(Mockito.anyLong(), Mockito.anyList());

    assertThrows(
        LibraryPluginException.class,
        () -> controller.runLibraryPluginOnSelectedComicBooks(session, TEST_PLUGIN_ID));
  }

  @Test
  void runLibraryPluginOnSelectedComicBooks() throws LibraryPluginException {
    controller.runLibraryPluginOnSelectedComicBooks(session, TEST_PLUGIN_ID);

    Mockito.verify(libraryPluginService, Mockito.times(1))
        .runLibraryPlugin(TEST_PLUGIN_ID, selectedIds);
    Mockito.verify(comicSelectionService, Mockito.times(1)).clearSelectedComicBooks(selectedIds);
  }
}
