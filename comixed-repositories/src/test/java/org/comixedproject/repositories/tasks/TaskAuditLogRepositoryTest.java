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

package org.comixedproject.repositories.tasks;

import static junit.framework.TestCase.*;

import com.github.springtestdbunit.DbUnitTestExecutionListener;
import com.github.springtestdbunit.annotation.DatabaseSetup;
import java.util.Date;
import java.util.List;
import java.util.Random;
import org.comixedproject.model.tasks.TaskAuditLogEntry;
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
public class TaskAuditLogRepositoryTest {
  private static final Random RANDOM = new Random();
  private static final int TEST_LOG_ENTRY_RESULT_SIZE = 5;
  private static final Date TEST_START_TIMESTAMP =
      new Date(System.currentTimeMillis() - 58L * 60L * 1000L);
  private static final Date TEST_STARTED = new Date(System.currentTimeMillis() - 3L * 60L * 1000L);
  private static final Date TEST_ENDED = new Date();
  private static final Boolean TEST_SUCCESSFUL = RANDOM.nextBoolean();
  private static final String TEST_DESCRIPTION = "The task description";

  @Autowired private TaskAuditLogRepository repository;

  @Test
  public void testGetEntriesEarliestStartTime() {
    final List<TaskAuditLogEntry> result =
        this.repository.findAllByStartTimeGreaterThanOrderByStartTime(new Date(0L));

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertEquals(TEST_LOG_ENTRY_RESULT_SIZE, result.size());
    for (int index = 0; index < result.size() - 1; index++) {
      assertTrue(
          result.get(index).getStartTime().getTime()
              < result.get(index + 1).getStartTime().getTime());
    }
  }

  @Test
  public void testGetEntriesAfterSpecifiedDate() {
    final List<TaskAuditLogEntry> result =
        this.repository.findAllByStartTimeGreaterThanOrderByStartTime(TEST_START_TIMESTAMP);

    assertNotNull(result);
    assertFalse(result.isEmpty());
    for (int index = 0; index < result.size() - 1; index++) {
      assertTrue(TEST_START_TIMESTAMP.getTime() < result.get(index).getStartTime().getTime());
      assertTrue(
          result.get(index).getStartTime().getTime()
              < result.get(index + 1).getStartTime().getTime());
    }
  }

  @Test
  public void testSaveEntry() {
    final TaskAuditLogEntry entry = new TaskAuditLogEntry();
    entry.setStartTime(TEST_STARTED);
    entry.setEndTime(TEST_ENDED);
    entry.setSuccessful(TEST_SUCCESSFUL);
    entry.setDescription(TEST_DESCRIPTION);

    final TaskAuditLogEntry result = repository.save(entry);

    assertNotNull(result);
    assertNotNull(result.getId());
    assertEquals(TEST_STARTED, result.getStartTime());
    assertEquals(TEST_ENDED, result.getEndTime());
    assertEquals(TEST_SUCCESSFUL, result.getSuccessful());
    assertEquals(TEST_DESCRIPTION, result.getDescription());

    final List<TaskAuditLogEntry> entries =
        repository.findAllByStartTimeGreaterThanOrderByStartTime(TEST_START_TIMESTAMP);

    assertTrue(entries.contains(result));
  }
}
