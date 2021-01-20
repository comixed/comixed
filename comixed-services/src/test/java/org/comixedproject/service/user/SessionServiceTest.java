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

package org.comixedproject.service.user;

import static junit.framework.TestCase.assertNotNull;
import static junit.framework.TestCase.assertTrue;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import org.comixedproject.model.auditlog.AuditEvent;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.comic.ComicAuditor;
import org.comixedproject.model.session.SessionUpdate;
import org.comixedproject.model.tasks.TaskType;
import org.comixedproject.service.comic.ComicService;
import org.comixedproject.service.task.TaskService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class SessionServiceTest {
  private static final long TEST_TIMESTAMP = System.currentTimeMillis();
  private static final int TEST_MAXIMUM_RECORDS = 100;
  private static final long TEST_TIMEOUT = 717L;
  private static final Integer TEST_TASK_COUNT = 213;
  private static final String TEST_EMAIL = "reading@comixed.org";

  @InjectMocks private SessionService sessionService;
  @Mock private ComicService comicService;
  @Mock private ComicAuditor comicAuditor;
  @Mock private TaskService taskService;
  @Mock private Comic comic;

  private List<Comic> comicList = new ArrayList<>();
  private List<AuditEvent<Long>> auditEntryList = new ArrayList<>();

  @Before
  public void setUp() {
    Mockito.when(comic.getDateLastUpdated()).thenReturn(new Date());
  }

  @Test
  public void testGetSessionUpdate() throws ComiXedUserException {
    comicList.add(comic);

    Mockito.when(
            comicService.getComicsUpdatedSince(
                Mockito.anyLong(), Mockito.anyInt(), Mockito.anyString()))
        .thenReturn(comicList);
    Mockito.when(comicAuditor.getEntriesSinceTimestamp(Mockito.anyLong(), Mockito.anyInt()))
        .thenReturn(auditEntryList);
    Mockito.when(taskService.getTaskCount(Mockito.any())).thenReturn(TEST_TASK_COUNT);

    final SessionUpdate result =
        sessionService.getSessionUpdate(
            TEST_TIMESTAMP, TEST_MAXIMUM_RECORDS, TEST_TIMEOUT, TEST_EMAIL);

    assertNotNull(result);
    assertTrue(result.getImportCount() > 0);

    Mockito.verify(comicService, Mockito.times(1))
        .getComicsUpdatedSince(TEST_TIMESTAMP, TEST_MAXIMUM_RECORDS, TEST_EMAIL);
    Mockito.verify(comicAuditor, Mockito.times(1))
        .getEntriesSinceTimestamp(TEST_TIMESTAMP, TEST_MAXIMUM_RECORDS);
    Mockito.verify(taskService, Mockito.times(1)).getTaskCount(TaskType.PROCESS_COMIC);
    Mockito.verify(taskService, Mockito.times(1)).getTaskCount(TaskType.ADD_COMIC);
  }
}
