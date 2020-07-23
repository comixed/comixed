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

import java.text.MessageFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import org.comixedproject.model.comic.Comic;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
public class FilenameScraperAdaptorTest {
  private static final String FILE_LOCATION = "/User/home/comixed_user/";
  private static final String SERIES_NAME = "Batman - Sins of the Father";
  private static final String VOLUME_NAME = "2018";
  private static final String ISSUE_NUMBER = "012";
  private static final String COVER_DATE_1 = "May, 2018";
  private static final String BAD_COVER_DATE = "Flg, 2018";
  private static final String COMIC_FILENAME_RULESET_1 =
      MessageFormat.format(
          "{0}{1} Vol.{2} #{3} ({4})",
          FILE_LOCATION, SERIES_NAME, VOLUME_NAME, ISSUE_NUMBER, COVER_DATE_1);
  private static final String COMIC_FILENAME_RULESET_2 =
      MessageFormat.format(
          "{0}{1} {2} ({3}) (Digital) (Blah blah blah.cbr",
          FILE_LOCATION, SERIES_NAME, ISSUE_NUMBER, VOLUME_NAME);
  private static final String COMIC_FILENAME_RULESET_3 =
      MessageFormat.format(
          "{0}{1} ({2}) (Lots of other crap)", FILE_LOCATION, SERIES_NAME, VOLUME_NAME);
  private static final String COMIC_FILENAME_RULESET_1_BAD_DATE =
      MessageFormat.format(
          "{0}{1} Vol.{2} #{3} ({4})",
          FILE_LOCATION, SERIES_NAME, VOLUME_NAME, ISSUE_NUMBER, BAD_COVER_DATE);
  private static final String COMIC_FILENAME_RULESET_4 =
      MessageFormat.format(
          "{0}{1} {2} (of {3}) ({4})",
          FILE_LOCATION, SERIES_NAME, ISSUE_NUMBER, ISSUE_NUMBER, VOLUME_NAME);

  private FilenameScraperAdaptor adaptor = new FilenameScraperAdaptor();

  @Mock private Comic comic;
  @Captor private ArgumentCaptor<Date> cover_date;

  @Before
  public void setUp() {
    Locale.setDefault(Locale.US);
  }

  @Test(expected = AdaptorException.class)
  public void testExecuteWithMalformedDate() throws ParseException, AdaptorException {
    Mockito.when(comic.getFilename()).thenReturn(COMIC_FILENAME_RULESET_1_BAD_DATE);
    Mockito.doNothing().when(comic).setSeries(Mockito.anyString());
    Mockito.doNothing().when(comic).setVolume(Mockito.anyString());
    Mockito.doNothing().when(comic).setIssueNumber(Mockito.anyString());

    try {
      adaptor.execute(comic);
    } finally {
      Mockito.verify(comic, Mockito.atLeast(1)).getFilename();
      Mockito.verify(comic, Mockito.atLeast(1)).setSeries(SERIES_NAME);
      Mockito.verify(comic, Mockito.atLeast(1)).setVolume(VOLUME_NAME);
      Mockito.verify(comic, Mockito.atLeast(1)).setIssueNumber(ISSUE_NUMBER);
    }
  }

  @Test
  public void testExecuteRuleset1FromNonUSLocale() throws ParseException, AdaptorException {
    Locale.setDefault(Locale.FRANCE);
    Mockito.when(comic.getFilename()).thenReturn(COMIC_FILENAME_RULESET_1);
    Mockito.doNothing().when(comic).setSeries(Mockito.anyString());
    Mockito.doNothing().when(comic).setVolume(Mockito.anyString());
    Mockito.doNothing().when(comic).setIssueNumber(Mockito.anyString());
    Mockito.doNothing().when(comic).setCoverDate(Mockito.any(Date.class));

    adaptor.execute(comic);

    Locale.setDefault(Locale.US);
    Mockito.verify(comic, Mockito.atLeast(1)).getFilename();
    Mockito.verify(comic, Mockito.atLeast(1)).setSeries(SERIES_NAME);
    Mockito.verify(comic, Mockito.atLeast(1)).setVolume(VOLUME_NAME);
    Mockito.verify(comic, Mockito.atLeast(1)).setIssueNumber(ISSUE_NUMBER);
    Mockito.verify(comic, Mockito.atLeast(1))
        .setCoverDate(new SimpleDateFormat("MMMMM, yyyy").parse(COVER_DATE_1));
  }

  @Test
  public void testExecuteRuleset1() throws ParseException, AdaptorException {
    Mockito.when(comic.getFilename()).thenReturn(COMIC_FILENAME_RULESET_1);
    Mockito.doNothing().when(comic).setSeries(Mockito.anyString());
    Mockito.doNothing().when(comic).setVolume(Mockito.anyString());
    Mockito.doNothing().when(comic).setIssueNumber(Mockito.anyString());
    Mockito.doNothing().when(comic).setCoverDate(Mockito.any(Date.class));

    adaptor.execute(comic);

    Mockito.verify(comic, Mockito.atLeast(1)).getFilename();
    Mockito.verify(comic, Mockito.atLeast(1)).setSeries(SERIES_NAME);
    Mockito.verify(comic, Mockito.atLeast(1)).setVolume(VOLUME_NAME);
    Mockito.verify(comic, Mockito.atLeast(1)).setIssueNumber(ISSUE_NUMBER);
    Mockito.verify(comic, Mockito.atLeast(1))
        .setCoverDate(new SimpleDateFormat("MMMMM, yyyy").parse(COVER_DATE_1));
  }

  @Test
  public void testExecuteRuleset2() throws AdaptorException {
    Mockito.when(comic.getFilename()).thenReturn(COMIC_FILENAME_RULESET_2);
    Mockito.doNothing().when(comic).setSeries(Mockito.anyString());
    Mockito.doNothing().when(comic).setVolume(Mockito.anyString());
    Mockito.doNothing().when(comic).setIssueNumber(Mockito.anyString());

    adaptor.execute(comic);

    Mockito.verify(comic, Mockito.atLeast(1)).getFilename();
    Mockito.verify(comic, Mockito.atLeast(1)).setSeries(SERIES_NAME);
    Mockito.verify(comic, Mockito.atLeast(1)).setVolume(VOLUME_NAME);
    Mockito.verify(comic, Mockito.atLeast(1)).setIssueNumber(ISSUE_NUMBER);
  }

  @Test
  public void testExecuteRuleset3() throws AdaptorException {
    Mockito.when(comic.getFilename()).thenReturn(COMIC_FILENAME_RULESET_3);
    Mockito.doNothing().when(comic).setSeries(Mockito.anyString());
    Mockito.doNothing().when(comic).setVolume(Mockito.anyString());

    adaptor.execute(comic);

    Mockito.verify(comic, Mockito.atLeast(1)).getFilename();
    Mockito.verify(comic, Mockito.atLeast(1)).setSeries(SERIES_NAME);
    Mockito.verify(comic, Mockito.atLeast(1)).setVolume(VOLUME_NAME);
  }

  @Test
  public void testExecuteRuleset4() throws AdaptorException {
    Mockito.when(comic.getFilename()).thenReturn(COMIC_FILENAME_RULESET_4);
    Mockito.doNothing().when(comic).setSeries(Mockito.anyString());
    Mockito.doNothing().when(comic).setVolume(Mockito.anyString());
    Mockito.doNothing().when(comic).setIssueNumber(Mockito.anyString());

    adaptor.execute(comic);

    Mockito.verify(comic, Mockito.atLeast(1)).getFilename();
    Mockito.verify(comic, Mockito.atLeast(1)).setSeries(SERIES_NAME);
    Mockito.verify(comic, Mockito.atLeast(1)).setVolume(VOLUME_NAME);
    Mockito.verify(comic, Mockito.atLeast(1)).setIssueNumber(ISSUE_NUMBER);
  }
}
