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

package org.comixedproject.adaptors.comicbooks;

import static junit.framework.TestCase.assertEquals;
import static junit.framework.TestCase.assertNotNull;

import org.comixedproject.model.comicpages.Page;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class ComicPageAdaptorTest {
  private static final String TEST_RENAMING_RULE = "page-$INDEX";
  private static final int TEST_PAGE_INDEX = 3;
  private static final String TEST_FILENAME = "oldname3.png";
  private static final String TEST_EXPECTED_PAGE_NAME = "page-0004.png";
  private static final int TEST_PAGE_COUNT_LENGTH = 4;

  @InjectMocks private ComicPageAdaptor adaptor;
  @Mock private Page page;

  @Before
  public void setUp() {
    Mockito.when(page.getFilename()).thenReturn(TEST_FILENAME);
  }

  @Test
  public void testCreateFilenameFromRule() {
    final String result =
        adaptor.createFilenameFromRule(
            page, TEST_RENAMING_RULE, TEST_PAGE_INDEX, TEST_PAGE_COUNT_LENGTH);

    assertNotNull(result);
    assertEquals(TEST_EXPECTED_PAGE_NAME, result);
  }
}
