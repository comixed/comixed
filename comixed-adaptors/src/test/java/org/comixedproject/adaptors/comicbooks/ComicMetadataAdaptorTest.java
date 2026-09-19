/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project.
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

package org.comixedproject.adaptors.comicbooks;

import static org.comixedproject.adaptors.comicbooks.ComicMetadataAdaptor.CHANGED_COMIC_MARKER;
import static org.comixedproject.adaptors.comicbooks.ComicMetadataAdaptor.MISSING_ISSUE_NUMBER;
import static org.comixedproject.adaptors.comicbooks.ComicMetadataAdaptor.MISSING_VOLUME;
import static org.comixedproject.adaptors.comicbooks.ComicMetadataAdaptor.NO_COVER_DATE;
import static org.comixedproject.adaptors.comicbooks.ComicMetadataAdaptor.UNNAMED_SERIES;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Date;
import java.util.Set;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.comicbooks.ComicState;
import org.comixedproject.model.comicbooks.ComicTag;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ComicMetadataAdaptorTest {
  private static final Date TEST_COVER_DATE = new Date();
  private static final String TEST_SERIES_NAME = "The Series Name";
  private static final String TEST_VOLUME = "2023";
  private static final String TEST_ISSUE_NUMBER = "23.1";

  @InjectMocks private ComicMetadataAdaptor adaptor;
  @Mock private Comic comic;
  @Mock private Set<ComicTag> comicTags;

  @BeforeEach
  void setUp() {
    when(comic.getCoverDate()).thenReturn(TEST_COVER_DATE);
    when(comic.getSeries()).thenReturn(TEST_SERIES_NAME);
    when(comic.getVolume()).thenReturn(TEST_VOLUME);
    when(comic.getIssueNumber()).thenReturn(TEST_ISSUE_NUMBER);
  }

  @Test
  void clear() {
    when(comic.getTags()).thenReturn(comicTags);

    adaptor.clear(comic);

    verify(comic).setWebAddress("");
    verify(comic).setPublisher("");
    verify(comic).setImprint("");
    verify(comic).setSeries("");
    verify(comic).setVolume("");
    verify(comic).setIssueNumber("");
    verify(comic).setCoverDate(null);
    verify(comic).setTitle("");
    verify(comic).setDescription("");
    verify(comicTags).clear();
  }

  @Test
  void getDisplayableTitle_noMetadata() {
    when(comic.getCoverDate()).thenReturn(null);
    when(comic.getSeries()).thenReturn(null);
    when(comic.getVolume()).thenReturn(null);
    when(comic.getIssueNumber()).thenReturn(null);

    final String result = adaptor.getDisplayableTitle(comic);

    assertNotNull(result);
    assertEquals(
        String.format(
            "%s v%s #%s (%s)", UNNAMED_SERIES, MISSING_VOLUME, MISSING_ISSUE_NUMBER, NO_COVER_DATE),
        result);
  }

  @Test
  void getDisplayableTitle_noCoverDate() {
    when(comic.getCoverDate()).thenReturn(null);

    final String result = adaptor.getDisplayableTitle(comic);

    assertNotNull(result);
    assertEquals(
        String.format(
            "%s v%s #%s (%s)", TEST_SERIES_NAME, TEST_VOLUME, TEST_ISSUE_NUMBER, NO_COVER_DATE),
        result);
  }

  @Test
  void getDisplayableTitle_noSeries() {
    when(comic.getSeries()).thenReturn(null);

    final String result = adaptor.getDisplayableTitle(comic);

    assertNotNull(result);
    assertEquals(
        String.format(
            "%s v%s #%s (%s)",
            UNNAMED_SERIES,
            TEST_VOLUME,
            TEST_ISSUE_NUMBER,
            adaptor.coverDateFormat.format(TEST_COVER_DATE)),
        result);
  }

  @Test
  void getDisplayableTitle_noVolume() {
    when(comic.getVolume()).thenReturn(null);

    final String result = adaptor.getDisplayableTitle(comic);

    assertNotNull(result);
    assertEquals(
        String.format(
            "%s v%s #%s (%s)",
            TEST_SERIES_NAME,
            MISSING_VOLUME,
            TEST_ISSUE_NUMBER,
            adaptor.coverDateFormat.format(TEST_COVER_DATE)),
        result);
  }

  @Test
  void getDisplayableTitle_noIssueNumber() {
    when(comic.getIssueNumber()).thenReturn(null);

    final String result = adaptor.getDisplayableTitle(comic);

    assertNotNull(result);
    assertEquals(
        String.format(
            "%s v%s #%s (%s)",
            TEST_SERIES_NAME,
            TEST_VOLUME,
            MISSING_ISSUE_NUMBER,
            adaptor.coverDateFormat.format(TEST_COVER_DATE)),
        result);
  }

  @Test
  void getDisplayableTitle_metadataIsChanged() {
    when(comic.getState()).thenReturn(ComicState.CHANGED);

    final String result = adaptor.getDisplayableTitle(comic);

    assertNotNull(result);
    assertEquals(
        String.format(
            "%s v%s #%s (%s) %s",
            TEST_SERIES_NAME,
            TEST_VOLUME,
            TEST_ISSUE_NUMBER,
            adaptor.coverDateFormat.format(TEST_COVER_DATE),
            CHANGED_COMIC_MARKER),
        result);
  }
}
