/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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

package org.comixedproject.rest.comicbooks;

import static junit.framework.TestCase.assertNotNull;
import static junit.framework.TestCase.assertSame;

import java.util.List;
import org.comixedproject.model.comicbooks.Imprint;
import org.comixedproject.service.comicbooks.ImprintService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class ImprintControllerTest {
  @InjectMocks private ImprintController controller;
  @Mock private ImprintService imprintService;
  @Mock private List<Imprint> imprintList;

  @Test
  public void testGetAll() {
    Mockito.when(imprintService.getAll()).thenReturn(imprintList);

    final List<Imprint> result = controller.getAll();

    assertNotNull(result);
    assertSame(imprintList, result);

    Mockito.verify(imprintService, Mockito.times(1)).getAll();
  }
}
