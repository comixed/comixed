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
import org.comixedproject.model.comicbooks.ComicType;
import org.comixedproject.repositories.comicbooks.ComicDetailRepository;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.data.domain.Example;

@RunWith(MockitoJUnitRunner.class)
public class ComicBookSelectionServiceTest {
  private static final Long TEST_INCOMING_COMIC_ID = 717L;
  private static final Long TEST_EXISTING_COMIC_ID = 129L;
  private static final Integer TEST_COVER_YEAR = RandomUtils.nextInt(50) + 1970;
  private static final Integer TEST_COVER_MONTH = RandomUtils.nextInt(12);
  private static final ArchiveType TEST_ARCHIVE_TYPE = ArchiveType.CB7;
  private static final ComicType TEST_COMIC_TYPE = ComicType.ISSUE;
  private static final ComicState TEST_COMIC_STATE = ComicState.REMOVED;
  private static final Boolean TEST_READ_STATE = RandomUtils.nextBoolean();
  private static final Boolean TEST_UNSCRAPED_STATE = RandomUtils.nextBoolean();
  private static final String TEST_SEARCH_TEXT = "The search text";
  private final Set<Long> incomingIds = new HashSet<>();
  private final Set<Long> existingIds = new HashSet<>();
  private final List<ComicDetail> comicBookList = new ArrayList<>();

  @InjectMocks private ComicBookSelectionService service;
  @Mock private ComicDetailRepository comicDetailRepository;
  @Mock private ObjectFactory<ComicDetailExampleBuilder> exampleBuilderObjectFactory;
  @Mock private ComicDetailExampleBuilder exampleBuilder;
  @Mock private Example<ComicDetail> example;
  @Mock private PublishComicBookSelectionStateAction publishComicBookSelectionStateAction;
  @Mock private ComicDetail comicDetail;

  @Before
  public void setUp() {
    Mockito.when(comicDetail.getComicId()).thenReturn(TEST_INCOMING_COMIC_ID);
    comicBookList.add(comicDetail);

    Mockito.when(comicDetailRepository.findAll(example)).thenReturn(comicBookList);
    Mockito.when(exampleBuilder.build()).thenReturn(example);
    Mockito.when(exampleBuilderObjectFactory.getObject()).thenReturn(exampleBuilder);
  }

  @Test
  public void testSelectSingleComicNullExisting() throws ComicBookException, PublishingException {
    incomingIds.add(TEST_INCOMING_COMIC_ID);

    final Set<Long> result = service.selectSingleComicBook(null, TEST_INCOMING_COMIC_ID, true);

    assertNotNull(result);
    assertTrue(result.contains(TEST_INCOMING_COMIC_ID));

    Mockito.verify(publishComicBookSelectionStateAction, Mockito.times(1)).publish(result);
  }

  @Test
  public void testSelectSingleComicBookAddingSelection() throws PublishingException {
    existingIds.add(TEST_EXISTING_COMIC_ID);
    incomingIds.add(TEST_INCOMING_COMIC_ID);

    final Set<Long> result =
        service.selectSingleComicBook(existingIds, TEST_INCOMING_COMIC_ID, true);

    assertNotNull(result);
    assertSame(existingIds, result);
    assertTrue(result.contains(TEST_INCOMING_COMIC_ID));
    assertTrue(result.contains(TEST_EXISTING_COMIC_ID));

    Mockito.verify(publishComicBookSelectionStateAction, Mockito.times(1)).publish(result);
  }

  @Test
  public void testSelectSingleComicBookPublishingException() throws PublishingException {
    Mockito.doThrow(PublishingException.class)
        .when(publishComicBookSelectionStateAction)
        .publish(Mockito.anySet());

    existingIds.add(TEST_EXISTING_COMIC_ID);
    incomingIds.add(TEST_INCOMING_COMIC_ID);

    final Set<Long> result =
        service.selectSingleComicBook(existingIds, TEST_INCOMING_COMIC_ID, true);

    assertNotNull(result);
    assertSame(existingIds, result);
    assertTrue(result.contains(TEST_INCOMING_COMIC_ID));
    assertTrue(result.contains(TEST_EXISTING_COMIC_ID));

    Mockito.verify(publishComicBookSelectionStateAction, Mockito.times(1)).publish(result);
  }

  @Test
  public void testSelectSingleComicBookRemovingSelection() throws PublishingException {
    existingIds.add(TEST_EXISTING_COMIC_ID);
    existingIds.add(TEST_INCOMING_COMIC_ID);
    incomingIds.add(TEST_INCOMING_COMIC_ID);

    final Set<Long> result =
        service.selectSingleComicBook(existingIds, TEST_INCOMING_COMIC_ID, false);

    assertNotNull(result);
    assertSame(existingIds, result);
    assertTrue(result.contains(TEST_EXISTING_COMIC_ID));
    assertFalse(result.contains(TEST_INCOMING_COMIC_ID));

    Mockito.verify(publishComicBookSelectionStateAction, Mockito.times(1)).publish(result);
  }

  @Test
  public void testSelectSingleComicBookRemovingSelectionWithNullExistingSelections()
      throws PublishingException {
    incomingIds.add(TEST_INCOMING_COMIC_ID);

    final Set<Long> result = service.selectSingleComicBook(null, TEST_INCOMING_COMIC_ID, false);

    assertNotNull(result);
    assertTrue(result.isEmpty());

    Mockito.verify(publishComicBookSelectionStateAction, Mockito.times(1)).publish(result);
  }

  @Test
  public void testSelectSingleComicBookRemovingSelectionWithNoExistingSelections()
      throws PublishingException {
    existingIds.clear();
    incomingIds.add(TEST_INCOMING_COMIC_ID);

    final Set<Long> result =
        service.selectSingleComicBook(existingIds, TEST_INCOMING_COMIC_ID, false);

    assertNotNull(result);
    assertSame(existingIds, result);

    Mockito.verify(publishComicBookSelectionStateAction, Mockito.times(1)).publish(result);
  }

  @Test
  public void testSelectMultipleComicBooksNullExisting()
      throws ComicBookException, PublishingException {
    incomingIds.add(TEST_INCOMING_COMIC_ID);

    final Set<Long> result =
        service.selectMultipleComicBooks(
            null,
            TEST_COVER_YEAR,
            TEST_COVER_MONTH,
            TEST_ARCHIVE_TYPE,
            TEST_COMIC_TYPE,
            TEST_COMIC_STATE,
            TEST_READ_STATE,
            TEST_UNSCRAPED_STATE,
            TEST_SEARCH_TEXT,
            true);

    assertNotNull(result);
    assertTrue(result.contains(TEST_INCOMING_COMIC_ID));

    Mockito.verify(publishComicBookSelectionStateAction, Mockito.times(1)).publish(result);
  }

  @Test
  public void testSelectMultipleComicBooksAddingSelection() throws PublishingException {
    existingIds.add(TEST_EXISTING_COMIC_ID);
    incomingIds.add(TEST_INCOMING_COMIC_ID);

    final Set<Long> result =
        service.selectMultipleComicBooks(
            existingIds,
            TEST_COVER_YEAR,
            TEST_COVER_MONTH,
            TEST_ARCHIVE_TYPE,
            TEST_COMIC_TYPE,
            TEST_COMIC_STATE,
            TEST_READ_STATE,
            TEST_UNSCRAPED_STATE,
            TEST_SEARCH_TEXT,
            true);

    assertNotNull(result);
    assertSame(existingIds, result);
    assertTrue(result.contains(TEST_INCOMING_COMIC_ID));
    assertTrue(result.contains(TEST_EXISTING_COMIC_ID));

    Mockito.verify(publishComicBookSelectionStateAction, Mockito.times(1)).publish(result);
  }

  @Test
  public void testSelectMultipleComicBooksRemovingSelection() throws PublishingException {
    existingIds.add(TEST_EXISTING_COMIC_ID);
    existingIds.add(TEST_INCOMING_COMIC_ID);
    incomingIds.add(TEST_INCOMING_COMIC_ID);

    final Set<Long> result =
        service.selectMultipleComicBooks(
            existingIds,
            TEST_COVER_YEAR,
            TEST_COVER_MONTH,
            TEST_ARCHIVE_TYPE,
            TEST_COMIC_TYPE,
            TEST_COMIC_STATE,
            TEST_READ_STATE,
            TEST_UNSCRAPED_STATE,
            TEST_SEARCH_TEXT,
            false);

    assertNotNull(result);
    assertTrue(result.contains(TEST_EXISTING_COMIC_ID));
    assertFalse(result.contains(TEST_INCOMING_COMIC_ID));

    Mockito.verify(publishComicBookSelectionStateAction, Mockito.times(1)).publish(result);
  }

  @Test
  public void testSelectMultipleComicBooksPublishingException() throws PublishingException {
    Mockito.doThrow(PublishingException.class)
        .when(publishComicBookSelectionStateAction)
        .publish(Mockito.anySet());

    existingIds.add(TEST_EXISTING_COMIC_ID);
    existingIds.add(TEST_INCOMING_COMIC_ID);
    incomingIds.add(TEST_INCOMING_COMIC_ID);

    final Set<Long> result =
        service.selectMultipleComicBooks(
            existingIds,
            TEST_COVER_YEAR,
            TEST_COVER_MONTH,
            TEST_ARCHIVE_TYPE,
            TEST_COMIC_TYPE,
            TEST_COMIC_STATE,
            TEST_READ_STATE,
            TEST_UNSCRAPED_STATE,
            TEST_SEARCH_TEXT,
            false);

    assertNotNull(result);
    assertTrue(result.contains(TEST_EXISTING_COMIC_ID));
    assertFalse(result.contains(TEST_INCOMING_COMIC_ID));

    Mockito.verify(publishComicBookSelectionStateAction, Mockito.times(1)).publish(result);
  }

  @Test
  public void testSelectMultipleComicBooksRemovingSelectionWithNullExistingSelections()
      throws PublishingException {
    incomingIds.add(TEST_INCOMING_COMIC_ID);

    final Set<Long> result =
        service.selectMultipleComicBooks(
            existingIds,
            TEST_COVER_YEAR,
            TEST_COVER_MONTH,
            TEST_ARCHIVE_TYPE,
            TEST_COMIC_TYPE,
            TEST_COMIC_STATE,
            TEST_READ_STATE,
            TEST_UNSCRAPED_STATE,
            TEST_SEARCH_TEXT,
            false);

    assertNotNull(result);
    assertTrue(result.isEmpty());

    Mockito.verify(publishComicBookSelectionStateAction, Mockito.times(1)).publish(result);
  }

  @Test
  public void testSelectMultipleComicBooksRemovingSelectionWithNoExistingSelections()
      throws PublishingException {
    existingIds.clear();
    incomingIds.add(TEST_INCOMING_COMIC_ID);

    final Set<Long> result =
        service.selectMultipleComicBooks(
            existingIds,
            TEST_COVER_YEAR,
            TEST_COVER_MONTH,
            TEST_ARCHIVE_TYPE,
            TEST_COMIC_TYPE,
            TEST_COMIC_STATE,
            TEST_READ_STATE,
            TEST_UNSCRAPED_STATE,
            TEST_SEARCH_TEXT,
            false);

    assertNotNull(result);
    assertSame(existingIds, result);

    Mockito.verify(publishComicBookSelectionStateAction, Mockito.times(1)).publish(result);
  }

  @Test
  public void testClearComicBookSelections() throws PublishingException {
    final Set<Long> result = service.clearSelectedComicBooks();

    assertNotNull(result);
    assertTrue(result.isEmpty());

    Mockito.verify(publishComicBookSelectionStateAction, Mockito.times(1)).publish(result);
  }

  @Test
  public void testClearComicBookSelectionsPublishException() throws PublishingException {
    Mockito.doThrow(PublishingException.class)
        .when(publishComicBookSelectionStateAction)
        .publish(Mockito.anySet());

    final Set<Long> result = service.clearSelectedComicBooks();

    assertNotNull(result);
    assertTrue(result.isEmpty());

    Mockito.verify(publishComicBookSelectionStateAction, Mockito.times(1)).publish(result);
  }
}
