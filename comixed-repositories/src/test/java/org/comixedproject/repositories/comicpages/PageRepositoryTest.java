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

package org.comixedproject.repositories.comicpages;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNotSame;
import static org.junit.Assert.assertSame;
import static org.junit.Assert.assertTrue;

import com.github.springtestdbunit.DbUnitTestExecutionListener;
import com.github.springtestdbunit.annotation.DatabaseSetup;
import java.util.ArrayList;
import java.util.List;
import org.comixedproject.model.comicpages.DeletedPageAndComic;
import org.comixedproject.model.comicpages.Page;
import org.comixedproject.model.comicpages.PageState;
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
  private static final String TEST_DUPLICATE_PAGE_HASH_1 = "F0123456789ABCDEF0123456789ABCDE";
  private static final String TEST_DUPLICATE_PAGE_HASH_2 = "0123456789ABCDEF0123456789ABCDEF";
  private static final String TEST_DUPLICATE_PAGE_HASH_3 = "123456789ABCDEF0123456789ABCDEF0";
  private static final List<String> TEST_DUPLICATE_PAGE_HASHES = new ArrayList<>();
  private static final String TEST_INVALID_HASH = "111111111AAAAAA1111111111AAAAAA1";
  public static final String TEST_NOT_DELETED_HASH = "6789ABCDEF0123456789ABCDEF012345";
  private static final String TEST_DELETED_HASH = "56789ABCDEF0123456789ABCDEF01234";

  static {
    TEST_DUPLICATE_PAGE_HASHES.add(TEST_DUPLICATE_PAGE_HASH_1);
    TEST_DUPLICATE_PAGE_HASHES.add(TEST_DUPLICATE_PAGE_HASH_2);
    TEST_DUPLICATE_PAGE_HASHES.add(TEST_DUPLICATE_PAGE_HASH_3);
  }

  @Autowired private PageRepository repository;

  @Test
  public void testGetDuplicatePages() {
    List<Page> result = repository.getDuplicatePages();

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertEquals(6, result.size());
  }

  @Test
  public void testFindByHashNotFound() {
    final List<Page> result = repository.findByHash(TEST_INVALID_HASH);

    assertTrue(result.isEmpty());
  }

  @Test
  public void testFindByHash() {
    final List<Page> result = repository.findByHash(TEST_DUPLICATE_PAGE_HASH_1);

    assertFalse(result.isEmpty());
    assertEquals(TEST_DUPLICATE_PAGE_HASH_1, result.get(0).getHash());
  }

  @Test
  public void testFindByHashAndPageStateWantNotDeleted() {
    final List<Page> result =
        repository.findByHashAndPageState(TEST_NOT_DELETED_HASH, PageState.STABLE);

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertEquals(TEST_NOT_DELETED_HASH, result.get(0).getHash());
    assertNotSame(PageState.DELETED, result.get(0).getPageState());
  }

  @Test
  public void testFindByHashAndPageStateNotDeletedWantsDeleted() {
    final List<Page> result =
        repository.findByHashAndPageState(TEST_NOT_DELETED_HASH, PageState.DELETED);

    assertNotNull(result);
    assertTrue(result.isEmpty());
  }

  @Test
  public void testFindByHashAndPageStateDeleted() {
    final List<Page> result =
        repository.findByHashAndPageState(TEST_DELETED_HASH, PageState.DELETED);

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertEquals(TEST_DELETED_HASH, result.get(0).getHash());
    assertSame(PageState.DELETED, result.get(0).getPageState());
  }

  @Test
  public void testFindByHashAndPageStateDeletedWantsNotDeleted() {
    final List<Page> result =
        repository.findByHashAndPageState(TEST_DELETED_HASH, PageState.STABLE);

    assertNotNull(result);
    assertTrue(result.isEmpty());
  }

  @Test
  public void testLoadAllDeletedPages() {
    final List<DeletedPageAndComic> result = repository.loadAllDeletedPages();

    assertNotNull(result);
    assertFalse(result.isEmpty());
  }
}
