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
import java.util.List;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.messaging.comicbooks.PublishComicBookSelectionStateAction;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.model.comicbooks.ComicTagType;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.data.domain.Example;

@RunWith(MockitoJUnitRunner.class)
public class ComicBookSelectionServiceTest {
  private static final Long TEST_COMIC_BOOK_ID = 717L;
  private static final Object TEST_ENCODED_SELECTIONS = "The encoded selections";
  private static final ComicTagType TEST_TAG_TYPE = ComicTagType.STORY;
  private static final String TEST_TAG_VALUE = "Age Of Ultron";

  private final List selectedIds = new ArrayList();
  private final List<ComicDetail> comicDetailList = new ArrayList<>();

  @InjectMocks private ComicBookSelectionService service;
  @Mock private ComicDetailService comicDetailService;
  @Mock private ObjectMapper objectMapper;
  @Mock private Example<ComicDetail> example;
  @Mock private ComicDetailExampleBuilder exampleBuilder;
  @Mock private ObjectFactory<ComicDetailExampleBuilder> exampleBuilderObjectFactory;
  @Mock private PublishComicBookSelectionStateAction publishComicBookSelectionStateAction;
  @Mock private ComicDetail comicDetail;

  @Before
  public void setUp() {
    Mockito.when(exampleBuilder.build()).thenReturn(example);
    Mockito.when(exampleBuilderObjectFactory.getObject()).thenReturn(exampleBuilder);

    Mockito.when(comicDetail.getComicId()).thenReturn(TEST_COMIC_BOOK_ID);
    comicDetailList.add(comicDetail);
    Mockito.when(comicDetailService.findAllByExample(Mockito.any(Example.class)))
        .thenReturn(comicDetailList);
  }

  @Test
  public void testAddComicSelectionAlreadySelected() throws PublishingException {
    selectedIds.add(TEST_COMIC_BOOK_ID);

    service.addComicSelectionForUser(selectedIds, TEST_COMIC_BOOK_ID);

    Mockito.verify(publishComicBookSelectionStateAction, Mockito.never())
        .publish(Mockito.anyList());
  }

  @Test
  public void testAddComicSelection() throws PublishingException {
    selectedIds.clear();

    service.addComicSelectionForUser(selectedIds, TEST_COMIC_BOOK_ID);

    assertTrue(selectedIds.contains(TEST_COMIC_BOOK_ID));

    Mockito.verify(publishComicBookSelectionStateAction, Mockito.times(1)).publish(selectedIds);
  }

  @Test
  public void testAddComicSelectionPublishingException() throws PublishingException {
    Mockito.doThrow(PublishingException.class)
        .when(publishComicBookSelectionStateAction)
        .publish(Mockito.anyList());

    selectedIds.clear();

    service.addComicSelectionForUser(selectedIds, TEST_COMIC_BOOK_ID);

    assertTrue(selectedIds.contains(TEST_COMIC_BOOK_ID));
    Mockito.verify(publishComicBookSelectionStateAction, Mockito.times(1)).publish(selectedIds);
  }

  @Test
  public void testRemoveComicSelectionNotSelected() throws PublishingException {
    selectedIds.clear();

    service.removeComicSelectionFromUser(selectedIds, TEST_COMIC_BOOK_ID);

    Mockito.verify(publishComicBookSelectionStateAction, Mockito.never())
        .publish(Mockito.anyList());
  }

  @Test
  public void testRemoveComicSelection() throws PublishingException {
    selectedIds.add(TEST_COMIC_BOOK_ID);

    service.removeComicSelectionFromUser(selectedIds, TEST_COMIC_BOOK_ID);

    assertFalse(selectedIds.contains(TEST_COMIC_BOOK_ID));

    Mockito.verify(publishComicBookSelectionStateAction, Mockito.times(1)).publish(selectedIds);
  }

  @Test
  public void testRemoveComicSelectionPublishingException() throws PublishingException {
    Mockito.doThrow(PublishingException.class)
        .when(publishComicBookSelectionStateAction)
        .publish(Mockito.anyList());

    selectedIds.add(TEST_COMIC_BOOK_ID);

    service.removeComicSelectionFromUser(selectedIds, TEST_COMIC_BOOK_ID);

    assertFalse(selectedIds.contains(TEST_COMIC_BOOK_ID));

    Mockito.verify(publishComicBookSelectionStateAction, Mockito.times(1)).publish(selectedIds);
  }

  @Test
  public void testAddingMultipleComics() throws PublishingException {
    selectedIds.clear();

    service.selectByFilter(selectedIds, null, null, null, null, null, false, null, true);

    assertFalse(selectedIds.isEmpty());

    Mockito.verify(publishComicBookSelectionStateAction, Mockito.times(comicDetailList.size()))
        .publish(selectedIds);
  }

  @Test
  public void testRemovingMultipleComics() throws PublishingException {
    selectedIds.add(TEST_COMIC_BOOK_ID);

    service.selectByFilter(selectedIds, null, null, null, null, null, false, null, false);

    Mockito.verify(publishComicBookSelectionStateAction, Mockito.times(1)).publish(selectedIds);
  }

  @Test
  public void tesClearSelectedComicBooks() throws PublishingException {
    for (long id = 0; id < 1000L; id++) selectedIds.add(id);

    service.clearSelectedComicBooks(selectedIds);

    assertTrue(selectedIds.isEmpty());

    Mockito.verify(publishComicBookSelectionStateAction, Mockito.times(1)).publish(selectedIds);
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
          .readValue(TEST_ENCODED_SELECTIONS.toString(), List.class);
    }
  }

  @Test
  public void testDecodeSelections() throws ComicBookSelectionException, JsonProcessingException {
    selectedIds.add(TEST_COMIC_BOOK_ID.intValue());

    Mockito.when(objectMapper.readValue(Mockito.anyString(), Mockito.any(Class.class)))
        .thenReturn(selectedIds);

    final List result = service.decodeSelections(TEST_ENCODED_SELECTIONS);

    assertNotNull(result);
    assertEquals(selectedIds.size(), result.size());
    assertEquals(TEST_COMIC_BOOK_ID, result.get(0));

    Mockito.verify(objectMapper, Mockito.times(1))
        .readValue(TEST_ENCODED_SELECTIONS.toString(), List.class);
  }

  @Test
  public void testEncodeSelections() throws JsonProcessingException, ComicBookSelectionException {
    Mockito.when(objectMapper.writeValueAsString(Mockito.any()))
        .thenReturn(TEST_ENCODED_SELECTIONS.toString());

    final String result = service.encodeSelections(selectedIds);

    assertNotNull(result);
    assertEquals(TEST_ENCODED_SELECTIONS.toString(), result);

    Mockito.verify(objectMapper, Mockito.times(1)).writeValueAsString(selectedIds);
  }

  @Test(expected = ComicBookSelectionException.class)
  public void testEncodeSelectionsWithJsonProcessException()
      throws JsonProcessingException, ComicBookSelectionException {
    Mockito.when(objectMapper.writeValueAsString(Mockito.anyList()))
        .thenThrow(JsonProcessingException.class);

    try {
      service.encodeSelections(selectedIds);
    } finally {
      Mockito.verify(objectMapper, Mockito.times(1)).writeValueAsString(selectedIds);
    }
  }

  @Test
  public void testAddByTagTypeAndValue() {
    Mockito.when(
            comicDetailService.getAllComicsForTag(
                Mockito.any(ComicTagType.class),
                Mockito.anyString(),
                Mockito.isNull(),
                Mockito.anyBoolean()))
        .thenReturn(comicDetailList);

    final List emptyIds = new ArrayList();

    service.addByTagTypeAndValue(emptyIds, TEST_TAG_TYPE, TEST_TAG_VALUE);

    assertTrue(emptyIds.contains(TEST_COMIC_BOOK_ID));

    Mockito.verify(comicDetailService, Mockito.times(1))
        .getAllComicsForTag(TEST_TAG_TYPE, TEST_TAG_VALUE, null, false);
  }

  @Test
  public void testRemoveByTagTypeAndValue() {
    Mockito.when(
            comicDetailService.getAllComicsForTag(
                Mockito.any(ComicTagType.class),
                Mockito.anyString(),
                Mockito.isNull(),
                Mockito.anyBoolean()))
        .thenReturn(comicDetailList);

    final List emptyIds = new ArrayList();
    emptyIds.add(TEST_COMIC_BOOK_ID);
    emptyIds.add(TEST_COMIC_BOOK_ID * 2L);

    service.removeByTagTypeAndValue(emptyIds, TEST_TAG_TYPE, TEST_TAG_VALUE);

    assertFalse(emptyIds.contains(TEST_COMIC_BOOK_ID));
    assertFalse(emptyIds.isEmpty());

    Mockito.verify(comicDetailService, Mockito.times(1))
        .getAllComicsForTag(TEST_TAG_TYPE, TEST_TAG_VALUE, null, false);
  }
}
