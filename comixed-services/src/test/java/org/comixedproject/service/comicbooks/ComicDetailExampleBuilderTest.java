/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project.
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

import static org.junit.Assert.*;

import org.apache.commons.lang.math.RandomUtils;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.model.comicbooks.ComicState;
import org.comixedproject.model.comicbooks.ComicType;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.data.domain.Example;

@RunWith(MockitoJUnitRunner.class)
public class ComicDetailExampleBuilderTest {
  private static final String TEST_SEARCH_TEXT = "Some search text";
  private static final Integer TEST_COVER_YEAR = RandomUtils.nextInt(50) + 1970;
  private static final Integer TEST_COVER_MONTH = RandomUtils.nextInt(12) + 1;
  private static final ArchiveType TEST_ARCHIVE_TYPE =
      ArchiveType.values()[RandomUtils.nextInt(ArchiveType.values().length)];
  private static final ComicType TEST_COMIC_TYPE =
      ComicType.values()[RandomUtils.nextInt(ComicType.values().length)];
  private static final ComicState TEST_COMIC_STATE =
      ComicState.values()[RandomUtils.nextInt(ComicState.values().length)];
  private static final String TEST_PUBLISHER = "Publisher Name";
  private static final String TEST_SERIES = "Series Name";
  private static final String TEST_VOLUME = "2022";

  @InjectMocks private ComicDetailExampleBuilder builder;

  @Test
  public void testBuildWithSearchText() {
    builder.setSearchText(TEST_SEARCH_TEXT);

    final Example<ComicDetail> result = builder.build();

    assertNotNull(result);
  }

  @Test
  public void testBuildWithCoverYear() {
    builder.setCoverYear(TEST_COVER_YEAR);

    final Example<ComicDetail> result = builder.build();

    assertNotNull(result);
  }

  @Test
  public void testBuildWithCoverMonth() {
    builder.setCoverMonth(TEST_COVER_MONTH);

    final Example<ComicDetail> result = builder.build();

    assertNotNull(result);
  }

  @Test
  public void testBuildWithArchiveType() {
    builder.setArchiveType(TEST_ARCHIVE_TYPE);

    final Example<ComicDetail> result = builder.build();

    assertNotNull(result);
  }

  @Test
  public void testBuildWithComicType() {
    builder.setComicType(TEST_COMIC_TYPE);

    final Example<ComicDetail> result = builder.build();

    assertNotNull(result);
  }

  @Test
  public void testBuildWithComicState() {
    builder.setComicState(TEST_COMIC_STATE);

    final Example<ComicDetail> result = builder.build();

    assertNotNull(result);
  }

  @Test
  public void testBuildWithUnScrapedState() {
    builder.setUnscrapedState(true);

    final Example<ComicDetail> result = builder.build();

    assertNotNull(result);
  }

  @Test
  public void testBuildWithPublisher() {
    builder.setPublisher(TEST_PUBLISHER);

    final Example<ComicDetail> result = builder.build();

    assertNotNull(result);
  }

  @Test
  public void testBuildWithSeries() {
    builder.setSeries(TEST_SERIES);

    final Example<ComicDetail> result = builder.build();

    assertNotNull(result);
  }

  @Test
  public void testBuildWithVolume() {
    builder.setVolume(TEST_VOLUME);

    final Example<ComicDetail> result = builder.build();

    assertNotNull(result);
  }

  @Test
  public void testBuild() {
    final Example<ComicDetail> result = builder.build();

    assertNotNull(result);
  }
}
