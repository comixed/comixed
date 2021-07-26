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

package org.comixedproject.adaptors;

import static junit.framework.TestCase.assertFalse;
import static org.junit.Assert.assertTrue;

import java.text.MessageFormat;
import java.util.Date;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.scraping.ScrapingRule;
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
  private static final String TEST_FILE_LOCATION = "/User/home/comixedreader/";
  private static final String TEST_DATE_FORMAT = "MMMMM, yyyy";
  private static final String TEST_SERIES = "Batman";
  private static final String TEST_VOLUME = "2016";
  private static final String TEST_ISSUE_NUMBER = "65";
  private static final String TEST_COVERDATE_1 = "April, 2019";
  private static final String TEST_FILENAME =
      MessageFormat.format(
          "{0}{1} Vol.{2} #{3} ({4}).cbz",
          TEST_FILE_LOCATION, TEST_SERIES, TEST_VOLUME, TEST_ISSUE_NUMBER, TEST_COVERDATE_1);
  private static final String TEST_INVALID_FILENAME =
      MessageFormat.format(
          "{0}{1} Vol.{2} #{3} (04-2019).cbz",
          TEST_FILE_LOCATION, TEST_SERIES, TEST_VOLUME, TEST_ISSUE_NUMBER);
  private static final String TEST_FILENAME_INVALID_DATE =
      MessageFormat.format(
          "{0}{1} Vol.{2} #{3} (Farkle, 2019).cbz",
          TEST_FILE_LOCATION, TEST_SERIES, TEST_VOLUME, TEST_ISSUE_NUMBER);

  @InjectMocks private FilenameScraperAdaptor adaptor;
  @Mock private Comic comic;
  @Mock private ScrapingRule scrapingRule;

  @Before
  public void setUp() {
    Mockito.when(scrapingRule.getRule()).thenReturn(TEST_SCRAPING_RULE);
    Mockito.when(comic.getFilename()).thenReturn(TEST_FILENAME);
    Mockito.when(scrapingRule.getDateFormat()).thenReturn(TEST_DATE_FORMAT);
    Mockito.when(scrapingRule.getSeriesPosition()).thenReturn(2);
    Mockito.when(scrapingRule.getVolumePosition()).thenReturn(4);
    Mockito.when(scrapingRule.getIssueNumberPosition()).thenReturn(5);
    Mockito.when(scrapingRule.getCoverDatePosition()).thenReturn(6);
  }

  @Test
  public void testExecuteFilenameDoesNotApply() throws AdaptorException {
    Mockito.when(comic.getFilename()).thenReturn(TEST_INVALID_FILENAME);

    final boolean result = adaptor.execute(comic, scrapingRule);

    assertFalse(result);

    Mockito.verify(comic, Mockito.never()).setSeries(Mockito.anyString());
    Mockito.verify(comic, Mockito.never()).setVolume(Mockito.anyString());
    Mockito.verify(comic, Mockito.never()).setIssueNumber(Mockito.anyString());
    Mockito.verify(comic, Mockito.never()).setCoverDate(Mockito.any(Date.class));
  }

  @Test(expected = AdaptorException.class)
  public void testExecuteInvalidDate() throws AdaptorException {
    Mockito.when(comic.getFilename()).thenReturn(TEST_FILENAME_INVALID_DATE);

    try {
      adaptor.execute(comic, scrapingRule);
    } finally {
      Mockito.verify(comic, Mockito.never()).setSeries(Mockito.anyString());
      Mockito.verify(comic, Mockito.never()).setVolume(Mockito.anyString());
      Mockito.verify(comic, Mockito.never()).setIssueNumber(Mockito.anyString());
      Mockito.verify(comic, Mockito.never()).setCoverDate(Mockito.any(Date.class));
    }
  }

  @Test
  public void testExecute() throws AdaptorException {
    Mockito.when(comic.getFilename()).thenReturn(TEST_FILENAME);

    final boolean result = adaptor.execute(comic, scrapingRule);

    assertTrue(result);

    Mockito.verify(comic, Mockito.times(1)).setSeries(TEST_SERIES);
    Mockito.verify(comic, Mockito.times(1)).setVolume(TEST_VOLUME);
    Mockito.verify(comic, Mockito.times(1)).setIssueNumber(TEST_ISSUE_NUMBER);
    Mockito.verify(comic, Mockito.times(1)).setCoverDate(Mockito.any(Date.class));
  }
}
