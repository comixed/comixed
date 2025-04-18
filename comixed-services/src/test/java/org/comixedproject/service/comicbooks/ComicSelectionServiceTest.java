/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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

package org.comixedproject.service.comicbooks;

import static junit.framework.TestCase.*;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.apache.commons.lang.math.RandomUtils;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.messaging.comicbooks.PublishComicBookSelectionStateAction;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.model.comicbooks.ComicState;
import org.comixedproject.model.comicbooks.ComicTagType;
import org.comixedproject.model.comicbooks.ComicType;
import org.comixedproject.model.messaging.comicbooks.ComicBookSelectionEvent;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.service.library.DisplayableComicService;
import org.comixedproject.service.user.ComiXedUserException;
import org.comixedproject.service.user.UserService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class ComicSelectionServiceTest {
  private static final Long TEST_COMIC_BOOK_ID = 717L;
  private static final Object TEST_ENCODED_SELECTIONS = "The encoded selections";
  private static final ComicTagType TEST_TAG_TYPE = ComicTagType.STORY;
  private static final String TEST_TAG_VALUE = "Age Of Ultron";
  private static final Integer TEST_YEAR = 2025;
  private static final Integer TEST_MONTH = 1;
  private static final ArchiveType TEST_ARCHIVE_TYPE =
      ArchiveType.values()[RandomUtils.nextInt(ArchiveType.values().length)];
  private static final ComicType TEST_COMIC_TYPE =
      ComicType.values()[RandomUtils.nextInt(ComicType.values().length)];
  private static final ComicState TEST_COMIC_STATE =
      ComicState.values()[RandomUtils.nextInt(ComicState.values().length)];
  private static final String TEST_SEARCH_TEXT = "The search text";
  private static final Integer TEST_PAGE_COUNT = 72;
  private static final String TEST_EMAIL = "user@comixedproject.org";

  private final List<Long> selectedIds = new ArrayList<>();
  private final Set<Long> storedSelectedIds = new HashSet<>();
  private final List<ComicDetail> comicDetailList = new ArrayList<>();

  @InjectMocks private ComicSelectionService service;
  @Mock private DisplayableComicService displayableComicService;
  @Mock private UserService userService;
  @Mock private ObjectMapper objectMapper;
  @Mock private PublishComicBookSelectionStateAction publishComicBookSelectionStateAction;
  @Mock private ComicDetail comicDetail;
  @Mock private ComiXedUser user;

  @Captor private ArgumentCaptor<ComicSelectionService.ListOfIds> idsArgumentCaptor;
  @Captor private ArgumentCaptor<ComicBookSelectionEvent> eventArgumentCaptor;

  @Before
  public void setUp() throws ComiXedUserException, PublishingException {
    comicDetailList.add(comicDetail);
    Mockito.lenient().when(userService.findByEmail(Mockito.anyString())).thenReturn(user);
    Mockito.lenient()
        .doNothing()
        .when(publishComicBookSelectionStateAction)
        .publish(eventArgumentCaptor.capture());
  }

  @Test
  public void testAddComicSelectionAlreadySelected() throws PublishingException {
    selectedIds.add(TEST_COMIC_BOOK_ID);

    service.addComicSelectionForUser(TEST_EMAIL, selectedIds, TEST_COMIC_BOOK_ID);

    Mockito.verify(publishComicBookSelectionStateAction, Mockito.never())
        .publish(Mockito.any(ComicBookSelectionEvent.class));
  }

  @Test
  public void testAddComicSelection() throws PublishingException {
    selectedIds.clear();

    service.addComicSelectionForUser(TEST_EMAIL, selectedIds, TEST_COMIC_BOOK_ID);

    final ComicBookSelectionEvent event = eventArgumentCaptor.getValue();
    assertSame(user, event.getUser());
    assertTrue(event.getComicBookIds().contains(TEST_COMIC_BOOK_ID));

    Mockito.verify(publishComicBookSelectionStateAction, Mockito.times(1)).publish(event);
  }

  @Test
  public void testAddComicSelectionPublishingException() throws PublishingException {
    Mockito.doThrow(PublishingException.class)
        .when(publishComicBookSelectionStateAction)
        .publish(eventArgumentCaptor.capture());

    selectedIds.clear();

    service.addComicSelectionForUser(TEST_EMAIL, selectedIds, TEST_COMIC_BOOK_ID);

    assertTrue(selectedIds.contains(TEST_COMIC_BOOK_ID));

    final ComicBookSelectionEvent event = eventArgumentCaptor.getValue();
    assertSame(user, event.getUser());
    assertSame(selectedIds, event.getComicBookIds());

    Mockito.verify(publishComicBookSelectionStateAction, Mockito.times(1)).publish(event);
  }

  @Test
  public void testRemoveComicSelectionNotSelected() throws PublishingException {
    selectedIds.clear();

    service.removeComicSelectionFromUser(TEST_EMAIL, selectedIds, TEST_COMIC_BOOK_ID);

    Mockito.verify(publishComicBookSelectionStateAction, Mockito.never())
        .publish(Mockito.any(ComicBookSelectionEvent.class));
  }

  @Test
  public void testRemoveComicSelection() throws PublishingException {
    selectedIds.add(TEST_COMIC_BOOK_ID);

    service.removeComicSelectionFromUser(TEST_EMAIL, selectedIds, TEST_COMIC_BOOK_ID);

    assertFalse(selectedIds.contains(TEST_COMIC_BOOK_ID));

    final ComicBookSelectionEvent event = eventArgumentCaptor.getValue();
    assertSame(user, event.getUser());
    assertSame(selectedIds, event.getComicBookIds());

    Mockito.verify(publishComicBookSelectionStateAction, Mockito.times(1)).publish(event);
  }

  @Test
  public void testRemoveComicSelectionPublishingException() throws PublishingException {
    Mockito.doThrow(PublishingException.class)
        .when(publishComicBookSelectionStateAction)
        .publish(eventArgumentCaptor.capture());

    selectedIds.add(TEST_COMIC_BOOK_ID);

    service.removeComicSelectionFromUser(TEST_EMAIL, selectedIds, TEST_COMIC_BOOK_ID);

    final ComicBookSelectionEvent event = eventArgumentCaptor.getValue();
    assertSame(user, event.getUser());
    assertFalse(event.getComicBookIds().contains(TEST_COMIC_BOOK_ID));

    Mockito.verify(publishComicBookSelectionStateAction, Mockito.times(1)).publish(event);
  }

  @Test
  public void testAddingMultipleComics() throws PublishingException {
    final List<Long> comicIds = new ArrayList<>();
    comicIds.add(TEST_COMIC_BOOK_ID);

    Mockito.when(
            displayableComicService.getIdsByFilter(
                Mockito.anyInt(),
                Mockito.anyInt(),
                Mockito.any(ArchiveType.class),
                Mockito.any(ComicType.class),
                Mockito.any(ComicState.class),
                Mockito.anyBoolean(),
                Mockito.anyInt(),
                Mockito.anyString()))
        .thenReturn(comicIds);

    selectedIds.clear();

    service.selectByFilter(
        TEST_EMAIL,
        selectedIds,
        TEST_YEAR,
        TEST_MONTH,
        TEST_ARCHIVE_TYPE,
        TEST_COMIC_TYPE,
        TEST_COMIC_STATE,
        false,
        TEST_PAGE_COUNT,
        TEST_SEARCH_TEXT,
        true);

    assertFalse(selectedIds.isEmpty());
    assertTrue(selectedIds.contains(TEST_COMIC_BOOK_ID));

    final ComicBookSelectionEvent event = eventArgumentCaptor.getValue();
    assertSame(user, event.getUser());
    assertSame(selectedIds, event.getComicBookIds());

    Mockito.verify(publishComicBookSelectionStateAction, Mockito.times(comicDetailList.size()))
        .publish(event);

    Mockito.verify(displayableComicService, Mockito.times(1))
        .getIdsByFilter(
            TEST_YEAR,
            TEST_MONTH,
            TEST_ARCHIVE_TYPE,
            TEST_COMIC_TYPE,
            TEST_COMIC_STATE,
            false,
            TEST_PAGE_COUNT,
            TEST_SEARCH_TEXT);
  }

  @Test
  public void testRemovingMultipleComics() throws PublishingException {
    final List<Long> comicIds = new ArrayList<>();
    comicIds.add(TEST_COMIC_BOOK_ID);
    selectedIds.add(TEST_COMIC_BOOK_ID);

    Mockito.when(
            displayableComicService.getIdsByFilter(
                Mockito.anyInt(),
                Mockito.anyInt(),
                Mockito.any(ArchiveType.class),
                Mockito.any(ComicType.class),
                Mockito.any(ComicState.class),
                Mockito.anyBoolean(),
                Mockito.anyInt(),
                Mockito.anyString()))
        .thenReturn(comicIds);

    service.selectByFilter(
        TEST_EMAIL,
        selectedIds,
        TEST_YEAR,
        TEST_MONTH,
        TEST_ARCHIVE_TYPE,
        TEST_COMIC_TYPE,
        TEST_COMIC_STATE,
        false,
        TEST_PAGE_COUNT,
        TEST_SEARCH_TEXT,
        false);

    assertTrue(selectedIds.isEmpty());

    final ComicBookSelectionEvent event = eventArgumentCaptor.getValue();
    assertSame(user, event.getUser());
    assertSame(selectedIds, event.getComicBookIds());

    Mockito.verify(publishComicBookSelectionStateAction, Mockito.times(comicDetailList.size()))
        .publish(event);

    Mockito.verify(displayableComicService, Mockito.times(1))
        .getIdsByFilter(
            TEST_YEAR,
            TEST_MONTH,
            TEST_ARCHIVE_TYPE,
            TEST_COMIC_TYPE,
            TEST_COMIC_STATE,
            false,
            TEST_PAGE_COUNT,
            TEST_SEARCH_TEXT);
  }

  @Test
  public void tesClearSelectedComicBooks() throws PublishingException {
    for (long id = 0; id < 1000L; id++) selectedIds.add(id);

    service.clearSelectedComicBooks(TEST_EMAIL, selectedIds);

    assertTrue(selectedIds.isEmpty());

    final ComicBookSelectionEvent event = eventArgumentCaptor.getValue();
    assertSame(user, event.getUser());
    assertSame(selectedIds, event.getComicBookIds());

    Mockito.verify(publishComicBookSelectionStateAction, Mockito.times(1)).publish(event);
  }

  @Test
  public void testDecodeSelectionsWithNull() throws ComicBookSelectionException {
    final List result = service.decodeSelections(null);

    assertNotNull(result);
    assertTrue(result.isEmpty());
  }

  @Test(expected = ComicBookSelectionException.class)
  public void testDecodeSelectionsWithJsonException()
      throws ComicBookSelectionException, JsonProcessingException {
    Mockito.when(objectMapper.readValue(Mockito.anyString(), Mockito.any(Class.class)))
        .thenThrow(JsonProcessingException.class);

    try {
      service.decodeSelections(TEST_ENCODED_SELECTIONS);
    } finally {
      Mockito.verify(objectMapper, Mockito.times(1))
          .readValue(TEST_ENCODED_SELECTIONS.toString(), ComicSelectionService.ListOfIds.class);
    }
  }

  @Test
  public void testDecodeSelections() throws ComicBookSelectionException, JsonProcessingException {
    final ComicSelectionService.ListOfIds encodedIds =
        new ComicSelectionService.ListOfIds(storedSelectedIds);
    storedSelectedIds.add(TEST_COMIC_BOOK_ID);

    Mockito.when(objectMapper.readValue(Mockito.anyString(), Mockito.any(Class.class)))
        .thenReturn(encodedIds);

    final List<Long> result = service.decodeSelections(TEST_ENCODED_SELECTIONS);

    assertNotNull(result);
    assertEquals(storedSelectedIds.size(), result.size());
    assertEquals(TEST_COMIC_BOOK_ID, result.get(0));

    Mockito.verify(objectMapper, Mockito.times(1))
        .readValue(TEST_ENCODED_SELECTIONS.toString(), ComicSelectionService.ListOfIds.class);
  }

  @Test
  public void testEncodeSelections() throws JsonProcessingException, ComicBookSelectionException {
    Mockito.when(objectMapper.writeValueAsString(idsArgumentCaptor.capture()))
        .thenReturn(TEST_ENCODED_SELECTIONS.toString());

    final String result = service.encodeSelections(selectedIds);

    assertNotNull(result);
    assertEquals(TEST_ENCODED_SELECTIONS.toString(), result);

    final ComicSelectionService.ListOfIds ids = idsArgumentCaptor.getValue();
    assertNotNull(ids);
    assertEquals(selectedIds, ids.getIds().stream().toList());

    Mockito.verify(objectMapper, Mockito.times(1)).writeValueAsString(ids);
  }

  @Test(expected = ComicBookSelectionException.class)
  public void testEncodeSelectionsWithJsonProcessException()
      throws JsonProcessingException, ComicBookSelectionException {
    Mockito.when(objectMapper.writeValueAsString(idsArgumentCaptor.capture()))
        .thenThrow(JsonProcessingException.class);

    try {
      service.encodeSelections(selectedIds);
    } finally {
      final ComicSelectionService.ListOfIds ids = idsArgumentCaptor.getValue();

      assertNotNull(ids);
      assertEquals(selectedIds, ids.getIds().stream().toList());

      Mockito.verify(objectMapper, Mockito.times(1)).writeValueAsString(ids);
    }
  }

  @Test
  public void testPublishSelections() throws PublishingException {
    service.publishSelections(TEST_EMAIL, selectedIds);

    final ComicBookSelectionEvent event = eventArgumentCaptor.getValue();
    assertSame(user, event.getUser());
    assertSame(selectedIds, event.getComicBookIds());

    Mockito.verify(publishComicBookSelectionStateAction, Mockito.times(1)).publish(event);
  }

  @Test
  public void testAddByTagTypeAndValue() {
    final List<Long> existingIds = new ArrayList<>();
    existingIds.add(TEST_COMIC_BOOK_ID);

    Mockito.when(
            displayableComicService.getIdsByTagTypeAndValue(
                Mockito.any(ComicTagType.class), Mockito.anyString()))
        .thenReturn(existingIds);

    final List emptyIds = new ArrayList();

    service.addByTagTypeAndValue(emptyIds, TEST_TAG_TYPE, TEST_TAG_VALUE);

    assertTrue(emptyIds.contains(TEST_COMIC_BOOK_ID));

    Mockito.verify(displayableComicService, Mockito.times(1))
        .getIdsByTagTypeAndValue(TEST_TAG_TYPE, TEST_TAG_VALUE);
  }

  @Test
  public void testRemoveByTagTypeAndValue() {
    final List<Long> existingIds = new ArrayList<>();
    existingIds.add(TEST_COMIC_BOOK_ID);

    Mockito.when(
            displayableComicService.getIdsByTagTypeAndValue(
                Mockito.any(ComicTagType.class), Mockito.anyString()))
        .thenReturn(existingIds);

    final List emptyIds = new ArrayList();
    emptyIds.add(TEST_COMIC_BOOK_ID);
    emptyIds.add(TEST_COMIC_BOOK_ID * 2L);

    service.removeByTagTypeAndValue(emptyIds, TEST_TAG_TYPE, TEST_TAG_VALUE);

    assertFalse(emptyIds.contains(TEST_COMIC_BOOK_ID));
    assertFalse(emptyIds.isEmpty());

    Mockito.verify(displayableComicService, Mockito.times(1))
        .getIdsByTagTypeAndValue(TEST_TAG_TYPE, TEST_TAG_VALUE);
  }
}
