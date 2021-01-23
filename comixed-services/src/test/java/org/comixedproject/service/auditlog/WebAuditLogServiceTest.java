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

package org.comixedproject.service.auditlog;

import static junit.framework.TestCase.*;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import org.comixedproject.model.auditlog.WebAuditLogEntry;
import org.comixedproject.repositories.auditlog.WebAuditLogRepository;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.data.domain.Pageable;

@RunWith(MockitoJUnitRunner.class)
public class WebAuditLogServiceTest {
  private static final Long TEST_CUTOFF = System.currentTimeMillis();

  @InjectMocks private WebAuditLogService webAuditLogService;
  @Mock private WebAuditLogRepository webAuditLogRepository;
  @Mock private WebAuditLogEntry incomingEntry;
  @Mock private WebAuditLogEntry savedEntry;
  @Captor private ArgumentCaptor<Pageable> pageableArgumentCaptor;

  private List<WebAuditLogEntry> auditLogEntryList = new ArrayList<>();

  @Test
  public void testSave() {
    Mockito.when(webAuditLogRepository.save(Mockito.any())).thenReturn(savedEntry);

    final WebAuditLogEntry result = this.webAuditLogService.save(incomingEntry);

    assertNotNull(result);
    assertSame(savedEntry, result);

    Mockito.verify(webAuditLogRepository, Mockito.times(1)).save(incomingEntry);
  }

  @Test
  public void testGetEntriesAfterDate() {
    auditLogEntryList.add(incomingEntry);

    Mockito.when(
            webAuditLogRepository.findByEndTimeAfterOrderByEndTime(
                Mockito.any(Date.class), pageableArgumentCaptor.capture()))
        .thenReturn(auditLogEntryList);

    final List<WebAuditLogEntry> result = webAuditLogService.getEntriesAfterDate(TEST_CUTOFF);

    assertNotNull(result);
    assertSame(auditLogEntryList, result);
    assertNotNull(pageableArgumentCaptor.getValue());
    assertEquals(0, pageableArgumentCaptor.getValue().getPageNumber());
    assertEquals(100, pageableArgumentCaptor.getValue().getPageSize());

    Mockito.verify(webAuditLogRepository, Mockito.times(1))
        .findByEndTimeAfterOrderByEndTime(new Date(TEST_CUTOFF), pageableArgumentCaptor.getValue());
  }

  @Test
  public void testDeleteAllRestAuditLog() {
    Mockito.doNothing().when(webAuditLogRepository).deleteAll();

    this.webAuditLogService.clearLogEntries();

    Mockito.verify(webAuditLogRepository, Mockito.times(1)).deleteAll();
  }
}
