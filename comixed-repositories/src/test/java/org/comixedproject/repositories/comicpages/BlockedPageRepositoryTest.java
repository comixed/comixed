/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project.
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

package org.comixedproject.repositories.comicpages;

import static junit.framework.TestCase.*;

import com.github.springtestdbunit.DbUnitTestExecutionListener;
import com.github.springtestdbunit.annotation.DatabaseSetup;
import java.util.List;
import org.comixedproject.model.comicpages.BlockedPage;
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
public class BlockedPageRepositoryTest {
  private static final String TEST_HASH_IN_DATABASE = "0123456789ABCDEF0123456789ABCDEF";
  private static final String TEST_HASH_NOT_IN_DATABASE =
      new StringBuilder(TEST_HASH_IN_DATABASE).reverse().toString();

  @Autowired private BlockedPageRepository repository;

  @Test
  public void testFindByHashNotFound() {
    assertNull(repository.findByHash(TEST_HASH_NOT_IN_DATABASE));
  }

  @Test
  public void tetFindByHash() {
    final BlockedPage result = repository.findByHash(TEST_HASH_IN_DATABASE);

    assertNotNull(result);
    assertEquals(TEST_HASH_IN_DATABASE, result.getHash());
  }

  @Test
  public void testGetAll() {
    final List<BlockedPage> result = repository.getAll();

    assertNotNull(result);
    assertFalse(result.isEmpty());
  }

  @Test
  public void testGetHashes() {
    final List<String> result = repository.getHashes();

    assertNotNull(result);
    assertFalse(result.isEmpty());
  }
}
