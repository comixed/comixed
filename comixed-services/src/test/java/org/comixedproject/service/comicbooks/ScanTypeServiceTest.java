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

package org.comixedproject.service.comicbooks;

import static junit.framework.TestCase.assertNotNull;
import static junit.framework.TestCase.assertSame;

import java.util.List;
import org.comixedproject.model.comicbooks.ScanType;
import org.comixedproject.repositories.comicbooks.ScanTypeRepository;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class ScanTypeServiceTest {
  @InjectMocks private ScanTypeService service;
  @Mock private ScanTypeRepository scanTypeRepository;
  @Mock private List<ScanType> scanTypeList;

  @Test
  public void testGetAll() {
    Mockito.when(scanTypeRepository.findAll()).thenReturn(scanTypeList);

    final List<ScanType> result = service.getAll();

    assertNotNull(result);
    assertSame(scanTypeList, result);

    Mockito.verify(scanTypeRepository, Mockito.times(1)).findAll();
  }
}
