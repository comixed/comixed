/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project.
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

import static junit.framework.TestCase.assertEquals;
import static junit.framework.TestCase.assertNotNull;
import static junit.framework.TestCase.assertSame;

import java.util.List;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.repositories.comicbooks.ComicDetailRepository;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.data.domain.Pageable;

@RunWith(MockitoJUnitRunner.class)
public class ComicDetailServiceTest {
  private static final long TEST_LAST_ID = 71765L;
  private static final int TEST_MAXIMUM = 1000;

  @InjectMocks private ComicDetailService service;
  @Mock private ComicDetailRepository comicDetailRepository;
  @Mock private List<ComicDetail> comicDetailList;

  @Captor private ArgumentCaptor<Pageable> pageableArgumentCaptor;

  @Test
  public void testLoadById() {
    Mockito.when(
            comicDetailRepository.getWithIdGreaterThan(
                Mockito.anyLong(), pageableArgumentCaptor.capture()))
        .thenReturn(comicDetailList);

    final List<ComicDetail> result = service.loadById(TEST_LAST_ID, TEST_MAXIMUM);

    assertNotNull(result);
    assertSame(comicDetailList, result);

    final Pageable pageable = pageableArgumentCaptor.getValue();
    assertNotNull(pageable);
    assertEquals(TEST_MAXIMUM, pageable.getPageSize());
    assertEquals(0, pageable.getPageNumber());

    Mockito.verify(comicDetailRepository, Mockito.times(1))
        .getWithIdGreaterThan(TEST_LAST_ID, pageable);
  }
}
