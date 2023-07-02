/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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

package org.comixedproject.rest.batch;

import static org.junit.Assert.*;

import java.util.List;
import org.comixedproject.model.batch.BatchProcess;
import org.comixedproject.service.batch.BatchProcessesService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class BatchProcessesControllerTest {
  @InjectMocks private BatchProcessesController controller;
  @Mock private BatchProcessesService batchProcessesService;
  @Mock private List<BatchProcess> batchProcessList;

  @Test
  public void testGetAllBatchProcesses() {
    Mockito.when(batchProcessesService.getAllBatchProcesses()).thenReturn(batchProcessList);

    final List<BatchProcess> result = controller.getAllBatchProcesses();

    assertNotNull(result);
    assertSame(batchProcessList, result);

    Mockito.verify(batchProcessesService, Mockito.times(1)).getAllBatchProcesses();
  }
}
