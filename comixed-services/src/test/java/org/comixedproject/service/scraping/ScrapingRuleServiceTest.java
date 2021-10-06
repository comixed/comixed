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

package org.comixedproject.service.scraping;

import static junit.framework.TestCase.*;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import org.comixedproject.adaptors.comicbooks.FilenameScraperAdaptor;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.scraping.FilenameMetadata;
import org.comixedproject.model.scraping.ScrapingRule;
import org.comixedproject.repositories.scraping.ScrapingRuleRepository;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class ScrapingRuleServiceTest {
  private static final String TEST_FILENAME = "The filename";
  private static final String TEST_SERIES = "The series name";
  private static final String TEST_VOLUME = "The volume";
  private static final String TEST_ISSUE_NUMBER = "The issue number";
  private static final Date TEST_COVER_DATE = new Date();

  @InjectMocks private ScrapingRuleService service;
  @Mock private ScrapingRuleRepository scrapingRuleRepository;
  @Mock private FilenameScraperAdaptor filenameScraperAdaptor;
  @Mock private ScrapingRule scrapingRule;
  @Mock private Comic comic;

  private List<ScrapingRule> scrapingRuleList = new ArrayList<>();
  private FilenameMetadata metadata =
      new FilenameMetadata(true, TEST_SERIES, TEST_VOLUME, TEST_ISSUE_NUMBER, TEST_COVER_DATE);

  @Before
  public void setUp() {
    scrapingRuleList.add(scrapingRule);
    Mockito.when(scrapingRuleRepository.findAll()).thenReturn(scrapingRuleList);
  }

  @Test
  public void testGetAllRules() {
    Mockito.when(scrapingRuleRepository.findAll()).thenReturn(scrapingRuleList);

    final List<ScrapingRule> result = service.getAllRules();

    assertNotNull(result);
    assertSame(scrapingRuleList, result);

    Mockito.verify(scrapingRuleRepository, Mockito.times(1)).findAll();
  }

  @Test
  public void testGetInfoForFilenameRuleDoesNotApply() {
    Mockito.when(
            filenameScraperAdaptor.execute(Mockito.anyString(), Mockito.any(ScrapingRule.class)))
        .thenReturn(null);

    final FilenameMetadata result = service.getInfoFromFilename(TEST_FILENAME);

    assertNotNull(result);
    assertFalse(result.isFound());

    Mockito.verify(filenameScraperAdaptor, Mockito.times(1)).execute(TEST_FILENAME, scrapingRule);
  }

  @Test
  public void testGetInfoForFilename() {
    Mockito.when(
            filenameScraperAdaptor.execute(Mockito.anyString(), Mockito.any(ScrapingRule.class)))
        .thenReturn(metadata);

    final FilenameMetadata result = service.getInfoFromFilename(TEST_FILENAME);

    assertNotNull(result);
    assertEquals(TEST_COVER_DATE, result.getCoverDate());
    assertEquals(TEST_SERIES, result.getSeries());
    assertEquals(TEST_VOLUME, result.getVolume());
    assertEquals(TEST_ISSUE_NUMBER, result.getIssueNumber());

    Mockito.verify(filenameScraperAdaptor, Mockito.times(1)).execute(TEST_FILENAME, scrapingRule);
  }

  @Test
  public void testScrapeFilename() {
    Mockito.when(comic.getBaseFilename()).thenReturn(TEST_FILENAME);
    Mockito.when(
            filenameScraperAdaptor.execute(Mockito.anyString(), Mockito.any(ScrapingRule.class)))
        .thenReturn(metadata);

    service.scrapeFilename(comic);

    Mockito.verify(filenameScraperAdaptor, Mockito.times(1)).execute(TEST_FILENAME, scrapingRule);
    Mockito.verify(comic, Mockito.times(1)).setCoverDate(TEST_COVER_DATE);
    Mockito.verify(comic, Mockito.times(1)).setSeries(TEST_SERIES);
    Mockito.verify(comic, Mockito.times(1)).setVolume(TEST_VOLUME);
    Mockito.verify(comic, Mockito.times(1)).setIssueNumber(TEST_ISSUE_NUMBER);
  }

  @Test
  public void testScrapeFilenameNoRulesApplied() {
    Mockito.when(comic.getBaseFilename()).thenReturn(TEST_FILENAME);
    Mockito.when(
            filenameScraperAdaptor.execute(Mockito.anyString(), Mockito.any(ScrapingRule.class)))
        .thenReturn(null);

    service.scrapeFilename(comic);

    Mockito.verify(filenameScraperAdaptor, Mockito.times(1)).execute(TEST_FILENAME, scrapingRule);
    Mockito.verify(comic, Mockito.never()).setCoverDate(Mockito.any(Date.class));
    Mockito.verify(comic, Mockito.never()).setSeries(Mockito.anyString());
    Mockito.verify(comic, Mockito.never()).setVolume(Mockito.anyString());
    Mockito.verify(comic, Mockito.never()).setIssueNumber(Mockito.anyString());
  }
}
