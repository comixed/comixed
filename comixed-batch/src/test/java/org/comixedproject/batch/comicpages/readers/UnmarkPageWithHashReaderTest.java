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

package org.comixedproject.batch.comicpages.readers;

import static junit.framework.TestCase.*;
import static org.comixedproject.batch.comicpages.UnmarkPagesWithHashConfiguration.PARAM_UNMARK_PAGES_TARGET_HASH;

import java.util.ArrayList;
import java.util.List;
import org.comixedproject.model.comicpages.Page;
import org.comixedproject.service.comicpages.PageService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.StepExecution;

@RunWith(MockitoJUnitRunner.class)
public class UnmarkPageWithHashReaderTest {
  private static final int MAX_RECORDS = 25;
  private static final String TEST_PAGE_HASH = "T4RG3TP4G3H45H";

  @InjectMocks private UnmarkPageWithHashReader reader;
  @Mock private StepExecution stepException;
  @Mock private JobParameters jobParameters;
  @Mock private PageService pageService;
  @Mock private Page page;

  private List<Page> pageList = new ArrayList<>();

  @Test
  public void testBeforeStep() {
    Mockito.when(stepException.getJobParameters()).thenReturn(jobParameters);
    Mockito.when(jobParameters.getString(PARAM_UNMARK_PAGES_TARGET_HASH))
        .thenReturn(TEST_PAGE_HASH);

    reader.beforeStep(stepException);

    assertEquals(TEST_PAGE_HASH, reader.targetHash);
  }

  @Test
  public void testAfterStep() {
    assertNull(reader.afterStep(stepException));
  }

  @Test
  public void testReadNoneLoadedManyFound() {
    for (int index = 0; index < MAX_RECORDS; index++) pageList.add(page);

    Mockito.when(pageService.getMarkedWithHash(Mockito.anyString())).thenReturn(pageList);
    reader.targetHash = TEST_PAGE_HASH;

    final Page result = reader.read();

    assertNotNull(result);
    assertSame(page, result);
    assertFalse(pageList.isEmpty());
    assertEquals(MAX_RECORDS - 1, pageList.size());

    Mockito.verify(pageService, Mockito.times(1)).getMarkedWithHash(TEST_PAGE_HASH);
  }

  @Test
  public void testReadNoneRemaining() {
    reader.pageList = pageList;
    reader.targetHash = TEST_PAGE_HASH;

    final Page result = reader.read();

    assertNull(result);
    assertNull(reader.pageList);

    Mockito.verify(pageService, Mockito.never()).getMarkedWithHash(TEST_PAGE_HASH);
  }

  @Test
  public void testReadNoneLoadedNoneFound() {
    Mockito.when(pageService.getMarkedWithHash(Mockito.anyString())).thenReturn(pageList);

    reader.targetHash = TEST_PAGE_HASH;

    final Page result = reader.read();

    assertNull(result);
    assertNull(reader.pageList);

    Mockito.verify(pageService, Mockito.times(1)).getMarkedWithHash(TEST_PAGE_HASH);
  }
}
