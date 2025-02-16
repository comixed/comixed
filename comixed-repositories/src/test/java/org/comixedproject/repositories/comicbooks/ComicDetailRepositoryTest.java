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

package org.comixedproject.repositories.comicbooks;

import static junit.framework.TestCase.*;

import com.github.springtestdbunit.DbUnitTestExecutionListener;
import com.github.springtestdbunit.annotation.DatabaseSetup;
import java.util.List;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.repositories.RepositoryContext;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestExecutionListeners;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.support.DependencyInjectionTestExecutionListener;
import org.springframework.test.context.support.DirtiesContextTestExecutionListener;
import org.springframework.test.context.transaction.TransactionalTestExecutionListener;
import org.springframework.transaction.annotation.Transactional;

@RunWith(SpringJUnit4ClassRunner.class)
@SpringBootTest(classes = RepositoryContext.class)
@TestPropertySource(locations = "classpath:application.properties")
@DatabaseSetup("classpath:test-database.xml")
@TestExecutionListeners({
  DependencyInjectionTestExecutionListener.class,
  DirtiesContextTestExecutionListener.class,
  TransactionalTestExecutionListener.class,
  DbUnitTestExecutionListener.class
})
public class ComicDetailRepositoryTest {
  private static final String TEST_PUBLISHER = "Marvel";
  private static final String TEST_UNREAD_SERIES = "Unwanted Comic";
  private static final String TEST_UNREAD_VOLUME = "2015";
  private static final String TEST_READ_SERIES = "Steve Rogers: Captain America";
  private static final String TEST_READ_VOLUME = "2017";
  private static final String TEST_EMAIL = "comixedreader@localhost";
  private static final Long TEST_COMIC_BOOK_ID = 1000L;
  private static final Long TEST_COMIC_DETAIL_ID = 2000L;
  private static final String TEST_UPDATED_FILENAME =
      "/Users/comixed_reader/Documents/library/comics/comicbook.cbz";

  @Autowired private ComicDetailRepository repository;

  @Test
  public void testGetAllUnreadForPublisherAndSeriesAndVolume() {
    final List<ComicDetail> result =
        repository.getAllUnreadForPublisherAndSeriesAndVolume(
            TEST_PUBLISHER, TEST_UNREAD_SERIES, TEST_UNREAD_VOLUME, TEST_EMAIL);

    assertNotNull(result);
    assertFalse(result.isEmpty());
  }

  @Test
  public void testGetAllUnreadForPublisherAndSeriesAndVolumeFullyRead() {
    final List<ComicDetail> result =
        repository.getAllUnreadForPublisherAndSeriesAndVolume(
            TEST_PUBLISHER, TEST_READ_SERIES, TEST_READ_VOLUME, TEST_EMAIL);

    assertNotNull(result);
    assertTrue(result.isEmpty());
  }

  @Test
  public void testGetAllForPublisherAndSeriesANdVolume() {
    final List<ComicDetail> result =
        repository.getAllForPublisherAndSeriesAndVolume(
            TEST_PUBLISHER, TEST_READ_SERIES, TEST_READ_VOLUME);

    assertNotNull(result);
    assertFalse(result.isEmpty());
  }

  @Test
  public void testUnscrapedComicDetails() {
    List<ComicDetail> result = repository.findAll();

    assertFalse(result.stream().filter(ComicDetail::getUnscraped).toList().isEmpty());
    assertTrue(result.stream().anyMatch(comicDetail -> comicDetail.getPageCount() > 0));
  }

  @Test
  @Transactional
  public void testUpdateFilename() {
    repository.updateFilename(TEST_COMIC_DETAIL_ID, TEST_UPDATED_FILENAME);

    final ComicDetail after = repository.findByComicBookId(TEST_COMIC_BOOK_ID);

    assertEquals(TEST_COMIC_DETAIL_ID, after.getId());
    assertEquals(TEST_UPDATED_FILENAME, after.getFilename());
  }
}
