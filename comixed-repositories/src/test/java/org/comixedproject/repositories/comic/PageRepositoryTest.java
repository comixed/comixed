/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project
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

import static org.junit.Assert.*;

import com.github.springtestdbunit.DbUnitTestExecutionListener;
import com.github.springtestdbunit.annotation.DatabaseSetup;
import java.util.ArrayList;
import java.util.List;
import org.comixedproject.model.comic.Page;
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
public class PageRepositoryTest {
  private static final Long BLOCKED_PAGE_ID = 1000L;
  private static final Long UNBLOCKED_PAGE_ID = 1001L;
  private static final String TEST_DUPLICATE_PAGE_HASH_1 = "F0123456789ABCDEF0123456789ABCDE";
  private static final String TEST_DUPLICATE_PAGE_HASH_2 = "0123456789ABCDEF0123456789ABCDEF";
  private static final String TEST_DUPLICATE_PAGE_HASH_3 = "123456789ABCDEF0123456789ABCDEF0";
  private static final List<String> TEST_DUPLICATE_PAGE_HASHES = new ArrayList<>();
  private static final String TEST_INVALID_HASH = "111111111AAAAAA1111111111AAAAAA1";

  static {
    TEST_DUPLICATE_PAGE_HASHES.add(TEST_DUPLICATE_PAGE_HASH_1);
    TEST_DUPLICATE_PAGE_HASHES.add(TEST_DUPLICATE_PAGE_HASH_2);
    TEST_DUPLICATE_PAGE_HASHES.add(TEST_DUPLICATE_PAGE_HASH_3);
  }

  @Autowired private PageRepository repository;

  @Test
  public void testGetPageWithBlockedHash() {
    Page result = repository.findById(BLOCKED_PAGE_ID).get();

    assertTrue(result.isBlocked());
  }

  @Test
  public void testGetPageWithNonBlockedHash() {
    Page result = repository.findById(UNBLOCKED_PAGE_ID).get();

    assertFalse(result.isBlocked());
  }

  @Test
  public void testGetDuplicatePages() {
    List<Page> result = repository.getDuplicatePages();

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertEquals(6, result.size());
  }

  @Test
  public void testUpdateDeleteOnAllWithHashAsDeleted() {
    int result = repository.updateDeleteOnAllWithHash(TEST_DUPLICATE_PAGE_HASH_1, true);

    assertEquals(2, result);

    Iterable<Page> pages = repository.findAll();
    for (Page page : pages) {
      if (page.getHash().equals(TEST_DUPLICATE_PAGE_HASH_1)) {
        assertTrue(page.isDeleted());
      }
    }
  }

  @Test
  public void testUpdateDeleteOnAllWithHashAsNotDeleted() {
    int result = repository.updateDeleteOnAllWithHash(TEST_DUPLICATE_PAGE_HASH_1, false);

    assertEquals(2, result);

    Iterable<Page> pages = repository.findAll();
    for (Page page : pages) {
      if (page.getHash().equals(TEST_DUPLICATE_PAGE_HASH_1)) {
        assertFalse(page.isDeleted());
      }
    }
  }

  @Test
  public void testGetPagesWithHashNoSuchHash() {
    final List<Page> result = repository.getPagesWithHash(TEST_INVALID_HASH);

    assertNotNull(result);
    assertTrue(result.isEmpty());
  }

  @Test
  public void testGetPagesWithHash() {
    final List<Page> result = repository.getPagesWithHash(TEST_DUPLICATE_PAGE_HASH_1);

    assertNotNull(result);
    assertFalse(result.isEmpty());
    for (int index = 0; index < result.size(); index++) {
      assertEquals(TEST_DUPLICATE_PAGE_HASH_1, result.get(index).getHash());
    }
  }
}
