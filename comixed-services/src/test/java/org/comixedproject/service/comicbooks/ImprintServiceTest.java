/*
 * ComiXed - A digital comicBook book library management application.
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

package org.comixedproject.service.comicbooks;

import static junit.framework.TestCase.assertNotNull;
import static junit.framework.TestCase.assertSame;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

import java.util.List;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.comicbooks.Imprint;
import org.comixedproject.repositories.comicbooks.ImprintRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ImprintServiceTest {
  private static final String TEST_IMPRINT = "Incoming Imprint";
  private static final String TEST_SAVED_IMPRINT = "Saved Imprint";
  private static final String TEST_PUBLISHER = "The Publisher";

  @InjectMocks private ImprintService imprintService;
  @Mock private ImprintRepository imprintRepository;
  @Mock private Comic comic;
  @Mock private Imprint imprint;
  @Mock private List<Imprint> imprintList;

  @Test
  void update_comicWithImprint() {
    when(comic.getImprint()).thenReturn(TEST_IMPRINT);
    when(imprintRepository.findByName(anyString())).thenReturn(imprint);
    when(imprint.getName()).thenReturn(TEST_SAVED_IMPRINT);
    when(imprint.getPublisher()).thenReturn(TEST_PUBLISHER);

    imprintService.update(comic);

    verify(imprintRepository).findByName(TEST_IMPRINT);
    verify(comic).setImprint(TEST_SAVED_IMPRINT);
    verify(comic).setPublisher(TEST_PUBLISHER);
  }

  @Test
  void update_comicWithoutImprint() {
    when(comic.getImprint()).thenReturn(TEST_IMPRINT);
    when(imprintRepository.findByName(anyString())).thenReturn(null);

    imprintService.update(comic);

    verify(imprintRepository).findByName(TEST_IMPRINT);
    verify(comic).setImprint("");
    verify(comic, never()).setPublisher(anyString());
  }

  @Test
  void getAll() {
    when(imprintRepository.findAll()).thenReturn(imprintList);

    final List<Imprint> result = imprintService.getAll();

    assertNotNull(result);
    assertSame(imprintList, result);

    verify(imprintRepository).findAll();
  }
}
