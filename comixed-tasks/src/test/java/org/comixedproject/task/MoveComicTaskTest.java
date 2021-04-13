/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project
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

package org.comixedproject.task;

import static junit.framework.TestCase.assertEquals;
import static junit.framework.TestCase.assertNotNull;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.TextStyle;
import java.util.Date;
import java.util.Locale;
import org.comixedproject.model.comic.Comic;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class MoveComicTaskTest {
  private static final String TEST_COMIC_FILENAME = "Super Awesome Issue #3";
  private static final String TEST_ROOT_DIRECTORY = "/Users/comixedreader/Documents/comics/library";
  private static final String TEST_FULL_COMIC_FILENAME =
      TEST_ROOT_DIRECTORY + "/" + TEST_COMIC_FILENAME + ".cbz";
  private static final String TEST_RELATIVE_NAME_WITHOUT_RULE = TEST_COMIC_FILENAME;
  private static final String TEST_RENAMING_RULE =
      "$PUBLISHER/$SERIES/$VOLUME/$SERIES v$VOLUME #$ISSUE ($COVERDATE)";
  private static final String TEST_PUBLISHER = "The Publisher";
  private static final String TEST_SERIES = "The Series";
  private static final String TEST_VOLUME = "2020";
  private static final String TEST_ISSUE = "717";
  private static final Date TEST_COVER_DATE = new Date(120, 6, 1);
  private static final LocalDate TEST_COVER_DATE_LOCALDATE =
      TEST_COVER_DATE.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
  private static final String TEST_FORMATTED_COVER_DATE =
      TEST_COVER_DATE_LOCALDATE.getMonth().getDisplayName(TextStyle.SHORT, Locale.getDefault())
          + " "
          + TEST_COVER_DATE_LOCALDATE.getYear();
  private static final String TEST_RELATIVE_NAME_WITH_RULE =
      String.format(
          "%s/%s/%s/%s v%s #%s (%s)",
          TEST_PUBLISHER,
          TEST_SERIES,
          TEST_VOLUME,
          TEST_SERIES,
          TEST_VOLUME,
          TEST_ISSUE,
          TEST_FORMATTED_COVER_DATE);
  private static final String TEST_RELATIVE_NAME_NO_PUBLISHER =
      String.format(
          "%s/%s/%s/%s v%s #%s (%s)",
          "Unknown",
          TEST_SERIES,
          TEST_VOLUME,
          TEST_SERIES,
          TEST_VOLUME,
          TEST_ISSUE,
          TEST_FORMATTED_COVER_DATE);
  private static final String TEST_RELATIVE_NAME_NO_SERIES =
      String.format(
          "%s/%s/%s/%s v%s #%s (%s)",
          TEST_PUBLISHER,
          "Unknown",
          TEST_VOLUME,
          "Unknown",
          TEST_VOLUME,
          TEST_ISSUE,
          TEST_FORMATTED_COVER_DATE);
  private static final String TEST_RELATIVE_NAME_NO_VOLUME =
      String.format(
          "%s/%s/%s/%s v%s #%s (%s)",
          TEST_PUBLISHER,
          TEST_SERIES,
          "Unknown",
          TEST_SERIES,
          "Unknown",
          TEST_ISSUE,
          TEST_FORMATTED_COVER_DATE);
  private static final String TEST_RELATIVE_NAME_NO_ISSUE_NUMBER =
      String.format(
          "%s/%s/%s/%s v%s #%s (%s)",
          TEST_PUBLISHER,
          TEST_SERIES,
          TEST_VOLUME,
          TEST_SERIES,
          TEST_VOLUME,
          "Unknown",
          TEST_FORMATTED_COVER_DATE);
  private static final String TEST_RELATIVE_NAME_NO_COVER_DATE =
      String.format(
          "%s/%s/%s/%s v%s #%s (%s)",
          TEST_PUBLISHER,
          TEST_SERIES,
          TEST_VOLUME,
          TEST_SERIES,
          TEST_VOLUME,
          TEST_ISSUE,
          "No Cover Date");
  private static final String TEST_PUBLISHER_WITH_UNSUPPORTED_CHARACTERS = "\"?Publisher*'";
  private static final String TEST_PUBLISHER_WITH_UNSUPPORTED_CHARACTERS_SCRUBBED = "__Publisher__";
  private static final String TEST_SERIES_WITH_UNSUPPORTED_CHARACTERS = "<|Series?>";
  private static final String TEST_SERIES_WITH_UNSUPPORTED_CHARACTERS_SCRUBBED = "__Series__";
  private static final String TEST_ISSUE_WITH_UNSUPPORTED_CHARACTERS = "\\/717:";
  private static final String TEST_ISSUE_WITH_UNSUPPORTED_CHARACTERS_SCRUBBED = "__717_";
  private static final String TEST_RELATIVE_NAME_SCRUBBED =
      String.format(
          "%s/%s/%s/%s v%s #%s (%s)",
          TEST_PUBLISHER_WITH_UNSUPPORTED_CHARACTERS_SCRUBBED,
          TEST_SERIES_WITH_UNSUPPORTED_CHARACTERS_SCRUBBED,
          TEST_VOLUME,
          TEST_SERIES_WITH_UNSUPPORTED_CHARACTERS_SCRUBBED,
          TEST_VOLUME,
          TEST_ISSUE_WITH_UNSUPPORTED_CHARACTERS_SCRUBBED,
          TEST_FORMATTED_COVER_DATE);
  private static final String TEST_RENAMING_RULE_WITH_UNSUPPORTED_CHARACTERS =
      "?*$PUBLISHER/<|?>$SERIES/\\:$VOLUME/$SERIES v$VOLUME #$ISSUE ($COVERDATE)";
  private static final String TEST_RELATIVE_NAME_WITH_RULE_WITH_SCRUBBED_CHARACTERS =
      String.format(
          "__%s/____%s/__%s/%s v%s #%s (%s)",
          TEST_PUBLISHER,
          TEST_SERIES,
          TEST_VOLUME,
          TEST_SERIES,
          TEST_VOLUME,
          TEST_ISSUE,
          TEST_FORMATTED_COVER_DATE);

  @InjectMocks private MoveComicTask task;
  @Mock private Comic comic;

  @Before
  public void setUp() {
    task.setComic(comic);
    task.setRenamingRule(TEST_RENAMING_RULE);

    Mockito.when(comic.getFilename()).thenReturn(TEST_FULL_COMIC_FILENAME);
    Mockito.when(comic.getPublisher()).thenReturn(TEST_PUBLISHER);
    Mockito.when(comic.getSeries()).thenReturn(TEST_SERIES);
    Mockito.when(comic.getVolume()).thenReturn(TEST_VOLUME);
    Mockito.when(comic.getIssueNumber()).thenReturn(TEST_ISSUE);
    Mockito.when(comic.getCoverDate()).thenReturn(TEST_COVER_DATE);
  }

  @Test
  public void testCreateDescription() {
    assertNotNull(task.createDescription());
  }

  @Test
  public void testGetRelativeComicFilenameWithoutRules() {
    task.setRenamingRule("");

    final String result = task.getRelativeComicFilename();

    assertEquals(TEST_RELATIVE_NAME_WITHOUT_RULE, result);
  }

  @Test
  public void testGetRelativeComicFilename() {
    final String result = task.getRelativeComicFilename();

    assertEquals(TEST_RELATIVE_NAME_WITH_RULE, result);
  }

  @Test
  public void testGetRelativeComicFilenameRenamingRuleHasUnsupportedCharacters() {
    task.setRenamingRule(TEST_RENAMING_RULE_WITH_UNSUPPORTED_CHARACTERS);

    final String result = task.getRelativeComicFilename();

    assertEquals(TEST_RELATIVE_NAME_WITH_RULE_WITH_SCRUBBED_CHARACTERS, result);
  }

  @Test
  public void testGetRelativeComicFilenameWithUnsupportedCharacters() {
    Mockito.when(comic.getPublisher()).thenReturn(TEST_PUBLISHER_WITH_UNSUPPORTED_CHARACTERS);
    Mockito.when(comic.getSeries()).thenReturn(TEST_SERIES_WITH_UNSUPPORTED_CHARACTERS);
    Mockito.when(comic.getIssueNumber()).thenReturn(TEST_ISSUE_WITH_UNSUPPORTED_CHARACTERS);

    final String result = task.getRelativeComicFilename();

    assertEquals(TEST_RELATIVE_NAME_SCRUBBED, result);
  }

  @Test
  public void testGetRelativeComicFilenameNoPublisher() {
    Mockito.when(comic.getPublisher()).thenReturn(null);

    final String result = task.getRelativeComicFilename();

    assertEquals(TEST_RELATIVE_NAME_NO_PUBLISHER, result);
  }

  @Test
  public void testGetRelativeComicFilenameNoSeries() {
    Mockito.when(comic.getSeries()).thenReturn(null);

    final String result = task.getRelativeComicFilename();

    assertEquals(TEST_RELATIVE_NAME_NO_SERIES, result);
  }

  @Test
  public void testGetRelativeComicFilenameNoVolume() {
    Mockito.when(comic.getVolume()).thenReturn(null);

    final String result = task.getRelativeComicFilename();

    assertEquals(TEST_RELATIVE_NAME_NO_VOLUME, result);
  }

  @Test
  public void testGetRelativeComicFilenameNoIssueNumber() {
    Mockito.when(comic.getIssueNumber()).thenReturn(null);

    final String result = task.getRelativeComicFilename();

    assertEquals(TEST_RELATIVE_NAME_NO_ISSUE_NUMBER, result);
  }

  @Test
  public void testGetRelativeComicFilenameNoCoverDate() {
    Mockito.when(comic.getCoverDate()).thenReturn(null);

    final String result = task.getRelativeComicFilename();

    assertEquals(TEST_RELATIVE_NAME_NO_COVER_DATE, result);
  }
}
