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

import java.util.ArrayList;
import java.util.List;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.comic.ComicSessionEventAuditor;
import org.comixedproject.model.page.BlockedPageHashSessionEventAuditor;
import org.comixedproject.model.session.SessionUpdateEvent;
import org.comixedproject.service.comic.ComicService;
import org.comixedproject.service.page.BlockedPageHashService;
import org.comixedproject.service.session.SessionService;
import org.comixedproject.service.task.TaskService;
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
  @Mock private BlockedPageHashService blockedPageHashService;
  @Mock private ComicSessionEventAuditor comicSessionEventAuditor;
  @Mock private BlockedPageHashSessionEventAuditor blockedPageHashSessionEventAuditor;
  @Mock private TaskService taskService;
  @Mock private Comic comic;

  private List<Comic> comicList = new ArrayList<>();
  private List<SessionUpdateEvent> auditEntryList = new ArrayList<>();
  private List<String> blockedPageHashList = new ArrayList<>();

  @Test
  public void testAfterPropertiesSet() throws Exception {
    Mockito.when(comicService.getAll()).thenReturn(comicList);
    Mockito.when(blockedPageHashService.getAllHashes()).thenReturn(blockedPageHashList);

    sessionService.afterPropertiesSet();

    Mockito.verify(comicService, Mockito.times(1)).getAll();
    Mockito.verify(blockedPageHashService, Mockito.times(1)).getAllHashes();
  }
}
