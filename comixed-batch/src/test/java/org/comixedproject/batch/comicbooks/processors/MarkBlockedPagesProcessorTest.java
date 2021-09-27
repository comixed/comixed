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

package org.comixedproject.batch.comicbooks.processors;

import static junit.framework.TestCase.assertNotNull;
import static junit.framework.TestCase.assertSame;

import java.util.ArrayList;
import java.util.List;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.comicpages.Page;
import org.comixedproject.model.comicpages.PageState;
import org.comixedproject.service.comicpages.BlockedPageService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class MarkBlockedPagesProcessorTest {
  private static final String TEST_HASH = "0123456789ABCDEF";

  @InjectMocks private MarkBlockedPagesProcessor processor;
  @Mock private BlockedPageService blockedPageService;
  @Mock private Comic comic;
  @Mock private Page page;

  private List<Page> pageList = new ArrayList<>();

  @Before
  public void setUp() {
    Mockito.when(comic.getPages()).thenReturn(pageList);
    Mockito.when(page.getHash()).thenReturn(TEST_HASH);
    pageList.add(page);
  }

  @Test
  public void testProcessWithBlockedPage() {
    Mockito.when(blockedPageService.isHashBlocked(Mockito.anyString())).thenReturn(true);

    final Comic result = processor.process(comic);

    assertNotNull(result);
    assertSame(comic, result);

    Mockito.verify(blockedPageService, Mockito.times(1)).isHashBlocked(TEST_HASH);
    Mockito.verify(page, Mockito.times(1)).setPageState(PageState.DELETED);
  }

  @Test
  public void testProcessWithoutBlockedPage() {
    Mockito.when(blockedPageService.isHashBlocked(Mockito.anyString())).thenReturn(false);

    final Comic result = processor.process(comic);

    assertNotNull(result);
    assertSame(comic, result);

    Mockito.verify(blockedPageService, Mockito.times(1)).isHashBlocked(TEST_HASH);
    Mockito.verify(page, Mockito.times(1)).setPageState(PageState.STABLE);
  }
}
