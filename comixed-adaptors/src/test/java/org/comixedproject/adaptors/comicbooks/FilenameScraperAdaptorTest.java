/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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

import static junit.framework.TestCase.*;
import static org.junit.Assert.assertNotNull;

import java.text.MessageFormat;
import org.comixedproject.model.scraping.FilenameMetadata;
import org.comixedproject.model.scraping.FilenameScrapingRule;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class FilenameScraperAdaptorTest {
  private static final String TEST_SCRAPING_RULE =
      "^(([\\w[\\s][,-]]+)?(\\sVol\\.))([0-9]{4}).*\\#([0-9]{1,5}).*\\(([a-zA-Z]+, [0-9]{4})\\).*$";
  private static final String TEST_DATE_FORMAT = "MMMMM, yyyy";
  private static final String TEST_SERIES = "Batman";
  private static final String TEST_VOLUME = "2016";
  private static final String TEST_ISSUE_NUMBER = "65";
  private static final String TEST_COVERDATE_1 = "April, 2019";
  private static final String TEST_FILENAME =
      MessageFormat.format(
          "{0} Vol.{1} #{2} ({3}).cbz",
          TEST_SERIES, TEST_VOLUME, TEST_ISSUE_NUMBER, TEST_COVERDATE_1);
  private static final String TEST_INVALID_FILENAME =
      MessageFormat.format(
          "{0} Vol.{1} #{2} (04-2019).cbz", TEST_SERIES, TEST_VOLUME, TEST_ISSUE_NUMBER);
  private static final String TEST_FILENAME_INVALID_DATE =
      MessageFormat.format(
          "{0} Vol.{1} #{2} (Farkle, 2019).cbz", TEST_SERIES, TEST_VOLUME, TEST_ISSUE_NUMBER);

  @InjectMocks private FilenameScraperAdaptor adaptor;
  @Mock private FilenameScrapingRule filenameScrapingRule;

  @Before
  public void setUp() {
    Mockito.when(filenameScrapingRule.getRule()).thenReturn(TEST_SCRAPING_RULE);
    Mockito.when(filenameScrapingRule.getDateFormat()).thenReturn(TEST_DATE_FORMAT);
    Mockito.when(filenameScrapingRule.getSeriesPosition()).thenReturn(2);
    Mockito.when(filenameScrapingRule.getVolumePosition()).thenReturn(4);
    Mockito.when(filenameScrapingRule.getIssueNumberPosition()).thenReturn(5);
    Mockito.when(filenameScrapingRule.getCoverDatePosition()).thenReturn(6);
  }

  @Test
  public void testExecuteFilenameDoesNotApply() {
    final FilenameMetadata result = adaptor.execute(TEST_INVALID_FILENAME, filenameScrapingRule);

    assertNotNull(result);
    assertFalse(result.isFound());
  }

  @Test
  public void testExecute() {
    final FilenameMetadata result = adaptor.execute(TEST_FILENAME, filenameScrapingRule);

    assertNotNull(result);

    assertNotNull(result.getCoverDate());
    assertEquals(TEST_SERIES, result.getSeries());
    assertEquals(TEST_VOLUME, result.getVolume());
    assertEquals(TEST_ISSUE_NUMBER, result.getIssueNumber());
  }

  @Test
  public void testExecuteInvalidDate() {
    final FilenameMetadata result =
        adaptor.execute(TEST_FILENAME_INVALID_DATE, filenameScrapingRule);

    assertNotNull(result);

    assertNull(result.getCoverDate());
    assertEquals(TEST_SERIES, result.getSeries());
    assertEquals(TEST_VOLUME, result.getVolume());
    assertEquals(TEST_ISSUE_NUMBER, result.getIssueNumber());
  }
}
