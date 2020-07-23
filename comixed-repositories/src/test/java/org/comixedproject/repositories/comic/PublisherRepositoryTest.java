/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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

package org.comixedproject.repositories.comic;

import static junit.framework.TestCase.*;

import com.github.springtestdbunit.DbUnitTestExecutionListener;
import com.github.springtestdbunit.annotation.DatabaseSetup;
import org.comixedproject.model.comic.Publisher;
import org.comixedproject.repositories.RepositoryContext;
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
public class PublisherRepositoryTest {
  private static final String TEST_PUBLISHER_NAME = "Super Soft Publishing";
  private static final String TEST_COMIC_VINE_ID = "23173";
  @Autowired private PublisherRepository publisherRepository;

  @Test
  public void testGetByName() {
    Publisher result = publisherRepository.findByName(TEST_PUBLISHER_NAME);

    assertNotNull(result);
    assertEquals(TEST_PUBLISHER_NAME, result.getName());
  }

  @Test
  public void testFindByComicVineIdNoSuchId() {
    Publisher result = publisherRepository.findByComicVineId(TEST_COMIC_VINE_ID.substring(1));

    assertNull(result);
  }

  @Test
  public void testFindByComicVineId() {
    Publisher result = publisherRepository.findByComicVineId(TEST_COMIC_VINE_ID);

    assertNotNull(result);
    assertEquals(TEST_COMIC_VINE_ID, result.getComicVineId());
  }
}
