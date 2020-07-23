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

package org.comixedproject.repositories.library;

import static org.junit.Assert.*;

import com.github.springtestdbunit.DbUnitTestExecutionListener;
import com.github.springtestdbunit.annotation.DatabaseSetup;
import java.util.List;
import java.util.Optional;
import org.comixedproject.model.library.Matcher;
import org.comixedproject.model.library.SmartReadingList;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.repositories.ComiXedUserRepository;
import org.comixedproject.repositories.RepositoryContext;
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
public class SmartReadingListRepositoryTest {
  private static final String TEST_EXISTING_LIST_NAME = "First Smart Reading List";
  private static final String TEST_NEW_LIST_NAME = "Third Smart Reading List";

  @Autowired private SmartReadingListRepository repository;
  @Autowired private ComiXedUserRepository userRepository;

  private ComiXedUser reader;

  @Before
  public void setUp() {
    reader = userRepository.findById(1000L).get();
  }

  @Test
  public void testFindAllSmartReadingListsForUser() {
    List<SmartReadingList> result = repository.findAllSmartReadingListsForUser(reader);

    assertNotNull(result);
    assertEquals(2, result.size());
    for (SmartReadingList list : result) {
      assertEquals(reader.getId(), list.getOwner().getId());
      switch (list.getId().intValue()) {
        case 1000:
          assertEquals("First Smart Reading List", list.getName());
          break;
        case 1001:
          assertEquals("Second Smart Reading List", list.getName());
          break;
      }
    }
  }

  @Test
  public void testFindSmartReadingListForUser() {
    SmartReadingList result =
        repository.findSmartReadingListForUser(reader, TEST_EXISTING_LIST_NAME);

    assertNotNull(result);
    assertEquals(TEST_EXISTING_LIST_NAME, result.getName());
    assertEquals(2, result.getMatchers().size());
    for (Matcher matcher : result.getMatchers()) {
      assertEquals(result.getId(), matcher.getSmartList().getId());
    }
  }

  @Test
  public void testCreateSmartReadingList() {
    SmartReadingList list = new SmartReadingList();

    list.setOwner(reader);
    list.setName(TEST_NEW_LIST_NAME);

    list.getMatchers().add(new Matcher(list));
    list.getMatchers().add(new Matcher(list));
    repository.save(list);

    SmartReadingList result = repository.findSmartReadingListForUser(reader, TEST_NEW_LIST_NAME);

    assertNotNull(result);
    assertEquals(reader.getId(), result.getOwner().getId());
    assertEquals(list.getMatchers().size(), result.getMatchers().size());
  }

  @Test
  public void testUpdateReadingList() {
    SmartReadingList list = repository.findById(1000L).get();
    Matcher newMatcher = new Matcher(list);
    newMatcher.setValue("Marvel");

    list.getMatchers().add(newMatcher);
    repository.save(list);

    SmartReadingList result = repository.findById(list.getId()).get();

    assertEquals(list.getMatchers().size(), result.getMatchers().size());
    boolean found = false;
    for (Matcher matcher : result.getMatchers()) {
      found |= (matcher.getValue().equals(newMatcher.getValue()));
    }
    assertTrue(found);
  }

  @Test
  public void testDeleteSmartReadingList() {
    SmartReadingList list = repository.findById(1000L).get();

    repository.delete(list);

    Optional<SmartReadingList> result = repository.findById(1000L);

    assertFalse(result.isPresent());
  }
}
