/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2024, The ComiXed Project
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

package org.comixedproject.batch.comicpages.readers;

import static junit.framework.TestCase.assertEquals;
import static junit.framework.TestCase.assertFalse;
import static junit.framework.TestCase.assertNotNull;
import static junit.framework.TestCase.assertNull;
import static junit.framework.TestCase.assertSame;

import java.util.ArrayList;
import java.util.List;
import org.comixedproject.model.comicpages.ComicPage;
import org.comixedproject.service.comicpages.ComicPageService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class MarkBlockedPagesReaderTest {
  private static final int MAX_RECORDS = 25;

  @InjectMocks private MarkBlockedPagesReader reader;
  @Mock private ComicPageService comicPageService;
  @Mock private ComicPage page;

  private List<ComicPage> pageList = new ArrayList<>();

  @Test
  public void testReadNoneLoaded() {
    for (int index = 0; index < MAX_RECORDS; index++) pageList.add(page);

    Mockito.when(comicPageService.getUnmarkedWithBlockedHash(Mockito.anyInt()))
        .thenReturn(pageList);

    reader.pageList = null;

    final ComicPage result = reader.read();

    assertNotNull(result);
    assertSame(page, result);
    assertFalse(pageList.isEmpty());
    assertEquals(MAX_RECORDS - 1, pageList.size());

    Mockito.verify(comicPageService, Mockito.times(1))
        .getUnmarkedWithBlockedHash(reader.getChunkSize());
  }

  @Test
  public void testReadNoneRemaining() {
    for (int index = 0; index < MAX_RECORDS; index++) pageList.add(page);

    Mockito.when(comicPageService.getUnmarkedWithBlockedHash(Mockito.anyInt()))
        .thenReturn(pageList);

    reader.pageList = new ArrayList<>();

    final ComicPage result = reader.read();

    assertNotNull(result);
    assertSame(page, result);
    assertFalse(pageList.isEmpty());
    assertEquals(MAX_RECORDS - 1, pageList.size());

    Mockito.verify(comicPageService, Mockito.times(1))
        .getUnmarkedWithBlockedHash(reader.getChunkSize());
  }

  @Test
  public void testReadSomeRemaining() {
    for (int index = 0; index < MAX_RECORDS; index++) pageList.add(page);

    reader.pageList = pageList;

    final ComicPage result = reader.read();

    assertNotNull(result);
    assertSame(page, result);
    assertFalse(pageList.isEmpty());
    assertEquals(MAX_RECORDS - 1, pageList.size());

    Mockito.verify(comicPageService, Mockito.never()).getUnmarkedWithBlockedHash(Mockito.anyInt());
  }

  @Test
  public void testReadNoneLoadedNoneFound() {
    Mockito.when(comicPageService.getUnmarkedWithBlockedHash(Mockito.anyInt()))
        .thenReturn(pageList);

    final ComicPage result = reader.read();

    assertNull(result);
    assertNull(reader.pageList);

    Mockito.verify(comicPageService, Mockito.times(1))
        .getUnmarkedWithBlockedHash(reader.getChunkSize());
  }
}
