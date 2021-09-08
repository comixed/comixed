/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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

package org.comixedproject.repositories.library;

import static junit.framework.TestCase.*;

import com.github.springtestdbunit.DbUnitTestExecutionListener;
import com.github.springtestdbunit.annotation.DatabaseSetup;
import java.util.List;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.library.LastRead;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.repositories.RepositoryContext;
import org.comixedproject.repositories.comicbooks.ComicRepository;
import org.comixedproject.repositories.users.ComiXedUserRepository;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
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
public class LastReadRepositoryTest {
  public static final int TEST_MAXIMUM = 15;

  @Autowired private LastReadRepository repository;
  @Autowired private ComiXedUserRepository userRepository;
  @Autowired private ComicRepository comicRepository;

  private ComiXedUser userWithoutEntries;
  private ComiXedUser user;
  private Comic comicWithEntries;
  private Comic comicWithNoEntries;

  @Before
  public void setUp() {
    userWithoutEntries = userRepository.getById(2000L);
    user = userRepository.getById(1000L);
    comicWithEntries = comicRepository.getById(1000L);
    comicWithNoEntries = comicRepository.getById(2000L);
  }

  @Test
  public void testGetEntriesForUserNoEntries() {
    final List<LastRead> result =
        this.repository.getEntriesForUser(userWithoutEntries, 0, PageRequest.of(0, TEST_MAXIMUM));

    assertNotNull(result);
    assertTrue(result.isEmpty());
  }

  @Test
  public void testGetEntriesForUser() {
    final List<LastRead> result =
        this.repository.getEntriesForUser(user, 0, PageRequest.of(0, TEST_MAXIMUM));

    assertNotNull(result);
    assertFalse(result.isEmpty());
    for (int index = 0; index < result.size(); index++) {
      if (index < result.size() - 1)
        assertTrue(result.get(index).getId() < result.get(index + 1).getId());
      assertEquals(user, result.get(index).getUser());
    }
  }

  @Test
  public void testGetEntriesForUserNoMoreEntries() {
    final List<LastRead> result =
        this.repository.getEntriesForUser(user, 1000L, PageRequest.of(0, TEST_MAXIMUM));

    assertNotNull(result);
    assertTrue(result.isEmpty());
  }

  @Test
  public void testFindEntryForUserAndComicForUserWithNoEntries() {
    final LastRead result =
        this.repository.findEntryForUserAndComic(userWithoutEntries, comicWithEntries);

    assertNull(result);
  }

  @Test
  public void testFindEntryForUserAndComicForUserWithEntriesButNoThisComic() {
    final LastRead result = this.repository.findEntryForUserAndComic(user, comicWithNoEntries);

    assertNull(result);
  }

  @Test
  public void testFindEntryForUserAndComic() {
    final LastRead result = this.repository.findEntryForUserAndComic(user, comicWithEntries);

    assertNotNull(result);
    assertEquals(user, result.getUser());
    assertEquals(comicWithEntries, result.getComic());
  }
}
