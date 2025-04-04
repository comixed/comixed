/*
 * ComiXed - A digital comicBook book library management application.
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

import static org.comixedproject.adaptors.comicbooks.ComicBookMetadataAdaptor.CHANGED_COMIC_MARKER;
import static org.comixedproject.adaptors.comicbooks.ComicBookMetadataAdaptor.MISSING_ISSUE_NUMBER;
import static org.comixedproject.adaptors.comicbooks.ComicBookMetadataAdaptor.MISSING_VOLUME;
import static org.comixedproject.adaptors.comicbooks.ComicBookMetadataAdaptor.NO_COVER_DATE;
import static org.comixedproject.adaptors.comicbooks.ComicBookMetadataAdaptor.UNNAMED_SERIES;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.util.Date;
import java.util.Set;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.model.comicbooks.ComicState;
import org.comixedproject.model.comicbooks.ComicTag;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ComicBookMetadataAdaptorTest {
  private static final Date TEST_COVER_DATE = new Date();
  private static final String TEST_SERIES_NAME = "The Series Name";
  private static final String TEST_VOLUME = "2023";
  private static final String TEST_ISSUE_NUMBER = "23.1";

  @InjectMocks private ComicBookMetadataAdaptor adaptor;
  @Mock private ComicBook comicBook;
  @Mock private ComicDetail comicDetail;
  @Mock private Set<ComicTag> comicTags;

  @BeforeEach
  void setUp() {
    Mockito.when(comicDetail.getCoverDate()).thenReturn(TEST_COVER_DATE);
    Mockito.when(comicDetail.getSeries()).thenReturn(TEST_SERIES_NAME);
    Mockito.when(comicDetail.getVolume()).thenReturn(TEST_VOLUME);
    Mockito.when(comicDetail.getIssueNumber()).thenReturn(TEST_ISSUE_NUMBER);
  }

  @Test
  void clear() {
    Mockito.when(comicBook.getComicDetail()).thenReturn(comicDetail);
    Mockito.when(comicDetail.getTags()).thenReturn(comicTags);

    adaptor.clear(comicBook);

    Mockito.verify(comicDetail, Mockito.times(1)).setWebAddress("");
    Mockito.verify(comicDetail, Mockito.times(1)).setPublisher("");
    Mockito.verify(comicDetail, Mockito.times(1)).setImprint("");
    Mockito.verify(comicDetail, Mockito.times(1)).setSeries("");
    Mockito.verify(comicDetail, Mockito.times(1)).setVolume("");
    Mockito.verify(comicDetail, Mockito.times(1)).setIssueNumber("");
    Mockito.verify(comicDetail, Mockito.times(1)).setCoverDate(null);
    Mockito.verify(comicDetail, Mockito.times(1)).setTitle("");
    Mockito.verify(comicDetail, Mockito.times(1)).setDescription("");
    Mockito.verify(comicTags, Mockito.times(1)).clear();
  }

  @Test
  void getDisplayableTitle_noMetadata() {
    Mockito.when(comicDetail.getCoverDate()).thenReturn(null);
    Mockito.when(comicDetail.getSeries()).thenReturn(null);
    Mockito.when(comicDetail.getVolume()).thenReturn(null);
    Mockito.when(comicDetail.getIssueNumber()).thenReturn(null);

    final String result = adaptor.getDisplayableTitle(comicDetail);

    assertNotNull(result);
    assertEquals(
        String.format(
            "%s v%s #%s (%s)", UNNAMED_SERIES, MISSING_VOLUME, MISSING_ISSUE_NUMBER, NO_COVER_DATE),
        result);
  }

  @Test
  void getDisplayableTitle_noCoverDate() {
    Mockito.when(comicDetail.getCoverDate()).thenReturn(null);

    final String result = adaptor.getDisplayableTitle(comicDetail);

    assertNotNull(result);
    assertEquals(
        String.format(
            "%s v%s #%s (%s)", TEST_SERIES_NAME, TEST_VOLUME, TEST_ISSUE_NUMBER, NO_COVER_DATE),
        result);
  }

  @Test
  void getDisplayableTitle_noSeries() {
    Mockito.when(comicDetail.getSeries()).thenReturn(null);

    final String result = adaptor.getDisplayableTitle(comicDetail);

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
    Mockito.when(comicDetail.getVolume()).thenReturn(null);

    final String result = adaptor.getDisplayableTitle(comicDetail);

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
    Mockito.when(comicDetail.getIssueNumber()).thenReturn(null);

    final String result = adaptor.getDisplayableTitle(comicDetail);

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
    Mockito.when(comicDetail.getComicState()).thenReturn(ComicState.CHANGED);

    final String result = adaptor.getDisplayableTitle(comicDetail);

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
