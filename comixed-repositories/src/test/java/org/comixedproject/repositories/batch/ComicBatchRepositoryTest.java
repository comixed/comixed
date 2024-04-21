/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2024, The ComiXed Project
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

package org.comixedproject.repositories.batch;

import static org.junit.Assert.*;

import com.github.springtestdbunit.DbUnitTestExecutionListener;
import com.github.springtestdbunit.annotation.DatabaseSetup;
import java.util.List;
import org.comixedproject.model.batch.ComicBatch;
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
public class ComicBatchRepositoryTest {
  private static final String TEST_BATCH_NAME = "test-batch-1";
  @Autowired private ComicBatchRepository repository;

  @Test
  public void testGetIncompleteBatchByNameNotFound() {
    final ComicBatch result = repository.getIncompleteBatchByName(TEST_BATCH_NAME.substring(1));

    assertNull(result);
  }

  @Test
  public void testGetIncompleteBatchByName() {
    final ComicBatch result = repository.getIncompleteBatchByName(TEST_BATCH_NAME);

    assertNotNull(result);
    assertEquals(TEST_BATCH_NAME, result.getName());
    assertFalse(result.isCompleted());
  }

  @Test
  public void testGetByNameNotFound() {
    final ComicBatch result = repository.getByName(TEST_BATCH_NAME.substring(1));

    assertNull(result);
  }

  @Test
  public void testGetByName() {
    final ComicBatch result = repository.getByName(TEST_BATCH_NAME);

    assertNotNull(result);
    assertEquals(TEST_BATCH_NAME, result.getName());
  }

  @Test
  public void testLoadCompletedBatches() {
    final List<ComicBatch> result = repository.loadCompletedBatches();

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertTrue(result.stream().allMatch(ComicBatch::isCompleted));
  }
}
