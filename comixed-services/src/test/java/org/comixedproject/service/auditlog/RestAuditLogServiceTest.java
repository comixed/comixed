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

import static junit.framework.TestCase.assertNotNull;
import static junit.framework.TestCase.assertSame;

import org.comixedproject.model.auditlog.RestAuditLogEntry;
import org.comixedproject.repositories.auditlog.RestAuditLogRepository;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class RestAuditLogServiceTest {
  @InjectMocks private RestAuditLogService restAuditLogService;
  @Mock private RestAuditLogRepository restAuditLogRepository;
  @Mock private RestAuditLogEntry incomingEntry;
  @Mock private RestAuditLogEntry savedEntry;

  @Test
  public void testSave() {
    Mockito.when(restAuditLogRepository.save(Mockito.any())).thenReturn(savedEntry);

    final RestAuditLogEntry result = this.restAuditLogService.save(incomingEntry);

    assertNotNull(result);
    assertSame(savedEntry, result);

    Mockito.verify(restAuditLogRepository, Mockito.times(1)).save(incomingEntry);
  }
}
