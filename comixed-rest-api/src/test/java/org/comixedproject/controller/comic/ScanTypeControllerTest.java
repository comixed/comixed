/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project.
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

package org.comixedproject.controller.comic;

import static org.comixedproject.controller.comic.ScanTypeController.ADD_SCAN_TYPE_QUEUE;

import java.util.ArrayList;
import java.util.List;
import org.comixedproject.model.comic.ScanType;
import org.comixedproject.service.comic.ScanTypeService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.messaging.simp.SimpMessagingTemplate;

@RunWith(MockitoJUnitRunner.class)
public class ScanTypeControllerTest {
  @InjectMocks private ScanTypeController controller;
  @Mock private ScanTypeService scanTypeService;
  @Mock private SimpMessagingTemplate messagingTemplate;
  @Mock private ScanType scanType;

  private List<ScanType> scanTypeList = new ArrayList<ScanType>();

  @Test
  public void testGetScanTypes() {
    scanTypeList.add(scanType);

    Mockito.when(scanTypeService.getAll()).thenReturn(scanTypeList);

    controller.getScanTypes();

    Mockito.verify(scanTypeService, Mockito.times(1)).getAll();
    Mockito.verify(messagingTemplate, Mockito.times(scanTypeList.size()))
        .convertAndSend(ADD_SCAN_TYPE_QUEUE, scanType);
  }
}
