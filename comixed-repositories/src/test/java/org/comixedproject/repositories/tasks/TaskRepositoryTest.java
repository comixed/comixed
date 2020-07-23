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
import java.util.List;
import org.comixedproject.model.tasks.Task;
import org.comixedproject.model.tasks.TaskType;
import org.comixedproject.repositories.RepositoryContext;
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
public class TaskRepositoryTest {
  private static final long TEST_FIRST_TASK_ID = 1000L;
  private static final String TEST_ADD_COMIC_FILENAME = "/path/to/comic1.cbz";
  @Autowired private TaskRepository repository;

  @Test
  public void testGetTasksToRun() {
    final List<Task> result = this.repository.getTasksToRun(PageRequest.of(0, 1));

    assertNotNull(result);
    assertFalse(result.isEmpty());
    final Task task = result.get(0);
    assertEquals(TEST_FIRST_TASK_ID, task.getId().longValue());
    assertSame(TaskType.ADD_COMIC, task.getTaskType());
    assertEquals(TEST_ADD_COMIC_FILENAME, task.getProperty("filename"));
    assertTrue(Boolean.valueOf(task.getProperty("delete-blocked-pages")));
    assertFalse(Boolean.valueOf(task.getProperty("ignore-metadata")));
  }
}
