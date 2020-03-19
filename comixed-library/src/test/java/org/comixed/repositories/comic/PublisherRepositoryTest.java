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

package org.comixed.repositories.comic;

import static junit.framework.TestCase.*;

import com.github.springtestdbunit.DbUnitTestExecutionListener;
import com.github.springtestdbunit.annotation.DatabaseSetup;
import org.comixed.model.comic.Publisher;
import org.comixed.repositories.RepositoryContext;
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
@DatabaseSetup("classpath:test-comics.xml")
@TestExecutionListeners({
  DependencyInjectionTestExecutionListener.class,
  DirtiesContextTestExecutionListener.class,
  TransactionalTestExecutionListener.class,
  DbUnitTestExecutionListener.class
})
public class PublisherRepositoryTest {
  private static final Long TEST_PUBLISHER_ID = 1000L;
  private static final String TEST_COMIC_VINE_ID = "23173";
  @Autowired private PublisherRepository publisherRepository;

  @Test
  public void testGetById() {
    Publisher result = publisherRepository.getById(TEST_PUBLISHER_ID);

    assertNotNull(result);
    assertEquals(TEST_PUBLISHER_ID, result.getId());
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
