/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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

package org.comixedproject.repositories.lists;

import static org.junit.Assert.*;

import com.github.springtestdbunit.DbUnitTestExecutionListener;
import com.github.springtestdbunit.annotation.DatabaseSetup;
import java.util.List;
import java.util.Optional;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.model.lists.ReadingList;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.repositories.RepositoryContext;
import org.comixedproject.repositories.comicbooks.ComicBookRepository;
import org.comixedproject.repositories.users.ComiXedUserRepository;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestExecutionListeners;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.context.support.DependencyInjectionTestExecutionListener;
import org.springframework.test.context.support.DirtiesContextTestExecutionListener;
import org.springframework.test.context.transaction.TransactionalTestExecutionListener;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = RepositoryContext.class)
@TestPropertySource(locations = "classpath:application.properties")
@DatabaseSetup("classpath:test-database.xml")
@TestExecutionListeners({
  DependencyInjectionTestExecutionListener.class,
  DirtiesContextTestExecutionListener.class,
  TransactionalTestExecutionListener.class,
  DbUnitTestExecutionListener.class
})
public class ReadingListRepositoryTest {
  private static final String TEST_EXISTING_LIST_NAME = "First Reading List";
  private static final String TEST_NEW_LIST_NAME = "Third Reading List";
  public static final long TEST_COMIC_ID_1 = 1000L;
  public static final long TEST_COMIC_ID_2 = 1001L;
  private static final long TEST_USER_ID_1 = 1000L;
  private static final long TEST_READING_LIST_ID_1 = 1000L;

  @Autowired private ReadingListRepository repository;
  @Autowired private ComiXedUserRepository userRepository;
  @Autowired private ComicBookRepository comicBookRepository;

  private ComiXedUser reader;
  private ComicDetail comicDetail1;
  private ComicDetail comicDetail2;

  @Before
  public void setUp() {
    reader = userRepository.findById(TEST_USER_ID_1).get();
    comicDetail1 = comicBookRepository.findById(TEST_COMIC_ID_1).get().getComicDetail();
    comicDetail2 = comicBookRepository.findById(TEST_COMIC_ID_2).get().getComicDetail();
  }

  @Test
  public void testFindAllReadingListsForUser() {
    List<ReadingList> result = repository.getAllReadingListsForOwner(reader);

    assertNotNull(result);
    assertEquals(2, result.size());
    for (ReadingList list : result) {
      assertEquals(reader.getId(), list.getOwner().getId());
      switch (list.getId().intValue()) {
        case 1000 -> assertEquals("First Reading List", list.getName());
        case 1001 -> assertEquals("Second Reading List", list.getName());
      }
    }
  }

  @Test
  public void testCheckForExistingReadingList() {
    boolean result = repository.checkForExistingReadingList(reader, TEST_EXISTING_LIST_NAME);

    assertTrue(result);
  }

  @Test
  public void testCheckForExistingReadingListNotFOund() {
    boolean result =
        repository.checkForExistingReadingList(reader, TEST_EXISTING_LIST_NAME.substring(1));

    assertFalse(result);
  }

  @Test
  public void testCreateReadingList() {
    ReadingList list = new ReadingList();

    list.setOwner(reader);
    list.setName(TEST_NEW_LIST_NAME);
    list.getEntryIds().add(comicDetail1.getId());
    list.getEntryIds().add(comicDetail2.getId());

    final ReadingList result = repository.save(list);

    assertNotNull(result);
    assertEquals(reader.getId(), result.getOwner().getId());
    assertEquals(list.getEntryIds().size(), result.getEntryIds().size());
  }

  @Test
  public void testUpdateReadingList() {
    ReadingList list = repository.getById(TEST_READING_LIST_ID_1);

    list.getEntryIds().add(comicDetail2.getComicId());
    repository.save(list);

    ReadingList result = repository.getById(list.getId());

    assertEquals(list.getEntryIds().size(), result.getEntryIds().size());
    assertTrue(result.getEntryIds().contains(comicDetail2.getComicId()));
  }

  @Test
  public void testDeleteReadingList() {
    ReadingList list = repository.findById(TEST_COMIC_ID_1).get();

    repository.delete(list);

    Optional<ReadingList> result = repository.findById(TEST_COMIC_ID_1);

    assertFalse(result.isPresent());
  }

  @Test
  public void testGetReadingListsWithComicBook() {
    final List<ReadingList> result = repository.getReadingListsWithComic(comicDetail1.getComicId());

    assertNotNull(result);
  }
}
