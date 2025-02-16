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

import java.util.List;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.model.comicbooks.Imprint;
import org.comixedproject.repositories.comicbooks.ImprintRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ImprintServiceTest {
  private static final String TEST_PUBLISHER = "Marvel";
  private static final String TEST_IMPRINT = "Marvel Soleil";

  @InjectMocks private ImprintService imprintService;
  @Mock private ImprintRepository imprintRepository;
  @Mock private ComicBook comicBook;
  @Mock private ComicDetail comicDetail;
  @Mock private Imprint imprint;
  @Mock private List<Imprint> imprintList;

  @BeforeEach
  public void setUp() {
    Mockito.when(comicBook.getComicDetail()).thenReturn(comicDetail);
    Mockito.when(comicDetail.getImprint()).thenReturn(TEST_IMPRINT);
    Mockito.when(imprint.getPublisher()).thenReturn(TEST_PUBLISHER);
    Mockito.when(imprint.getName()).thenReturn(TEST_IMPRINT);
  }

  @Test
  void update_comicWithImprint() {
    Mockito.when(imprintRepository.findByName(Mockito.anyString())).thenReturn(imprint);

    imprintService.update(comicBook);

    Mockito.verify(comicDetail, Mockito.times(1)).setImprint(TEST_IMPRINT);
    Mockito.verify(comicDetail, Mockito.times(1)).setPublisher(TEST_PUBLISHER);
  }

  @Test
  void update_comicWithoutImprint() {
    Mockito.when(imprintRepository.findByName(Mockito.anyString())).thenReturn(null);

    imprintService.update(comicBook);

    Mockito.verify(comicDetail, Mockito.times(1)).setImprint("");
    Mockito.verify(comicDetail, Mockito.never()).setPublisher(Mockito.anyString());
  }

  @Test
  void getAll() {
    Mockito.when(imprintRepository.findAll()).thenReturn(imprintList);

    final List<Imprint> result = imprintService.getAll();

    assertNotNull(result);
    assertSame(imprintList, result);

    Mockito.verify(imprintRepository, Mockito.times(1)).findAll();
  }
}
