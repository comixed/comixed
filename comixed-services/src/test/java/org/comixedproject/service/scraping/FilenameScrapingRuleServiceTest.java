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
import java.util.List;
import org.comixedproject.adaptors.comicbooks.FilenameScraperAdaptor;
import org.comixedproject.model.scraping.FilenameMetadata;
import org.comixedproject.model.scraping.FilenameScrapingRule;
import org.comixedproject.repositories.scraping.FilenameScrapingRuleRepository;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class FilenameScrapingRuleServiceTest {
  private static final int TEST_PRIORITY = 0;
  private static final String TEST_NAME = "Rule name";
  private static final String TEST_RULE = "Rule value";
  private static final Integer TEST_SERIES_POSITION = 1;
  private static final Integer TEST_VOLUME_POSITION = 2;
  private static final Integer TEST_ISSUE_NUMBER_POSITION = 3;
  private static final Integer TEST_COVER_DATE_POSITION = 4;
  private static final String TEST_DATE_FORMAT = "The date format";
  private static final String TEST_FILENAME = "The filename";

  @InjectMocks private FilenameScrapingRuleService service;
  @Mock private FilenameScrapingRuleRepository filenameScrapingRuleRepository;
  @Mock private FilenameScraperAdaptor filenameScraperAdaptor;
  @Mock private List<FilenameScrapingRule> savedRuleList;
  @Mock private FilenameScrapingRule filenameScrapingRule;
  @Mock private FilenameMetadata filenameMetadata;

  @Captor private ArgumentCaptor<List<FilenameScrapingRule>> ruleListArgumentCaptor;

  private List<FilenameScrapingRule> filenameScrapingRuleList = new ArrayList<>();

  @Before
  public void setUp() {
    filenameScrapingRuleList.add(filenameScrapingRule);

    Mockito.when(filenameScrapingRule.getPriority()).thenReturn(TEST_PRIORITY);
    Mockito.when(filenameScrapingRule.getName()).thenReturn(TEST_NAME);
    Mockito.when(filenameScrapingRule.getRule()).thenReturn(TEST_RULE);
    Mockito.when(filenameScrapingRule.getSeriesPosition()).thenReturn(TEST_SERIES_POSITION);
    Mockito.when(filenameScrapingRule.getVolumePosition()).thenReturn(TEST_VOLUME_POSITION);
    Mockito.when(filenameScrapingRule.getIssueNumberPosition())
        .thenReturn(TEST_ISSUE_NUMBER_POSITION);
    Mockito.when(filenameScrapingRule.getCoverDatePosition()).thenReturn(TEST_COVER_DATE_POSITION);
    Mockito.when(filenameScrapingRule.getDateFormat()).thenReturn(TEST_DATE_FORMAT);
  }

  @Test
  public void testLoadRules() {
    Mockito.when(filenameScrapingRuleRepository.findAll()).thenReturn(filenameScrapingRuleList);

    final List<FilenameScrapingRule> result = service.loadRules();

    assertNotNull(result);
    assertSame(filenameScrapingRuleList, result);

    Mockito.verify(filenameScrapingRuleRepository, Mockito.times(1)).findAll();
  }

  @Test
  public void testSaveRules() {
    Mockito.when(filenameScrapingRuleRepository.saveAll(ruleListArgumentCaptor.capture()))
        .thenReturn(savedRuleList);

    final List<FilenameScrapingRule> result = service.saveRules(filenameScrapingRuleList);

    assertNotNull(result);
    assertSame(savedRuleList, result);

    final List<FilenameScrapingRule> savedRules = ruleListArgumentCaptor.getValue();
    assertNotNull(savedRules);
    assertFalse(savedRules.isEmpty());

    final FilenameScrapingRule created = savedRules.get(0);
    assertEquals(TEST_PRIORITY, created.getPriority());
    assertEquals(TEST_NAME, created.getName());
    assertEquals(TEST_RULE, created.getRule());
    assertEquals(TEST_SERIES_POSITION, created.getSeriesPosition());
    assertEquals(TEST_VOLUME_POSITION, created.getVolumePosition());
    assertEquals(TEST_ISSUE_NUMBER_POSITION, created.getIssueNumberPosition());
    assertEquals(TEST_COVER_DATE_POSITION, created.getCoverDatePosition());
    assertEquals(TEST_DATE_FORMAT, created.getDateFormat());

    Mockito.verify(filenameScrapingRuleRepository, Mockito.times(1)).deleteAll();
    Mockito.verify(filenameScrapingRuleRepository, Mockito.times(1)).flush();
    Mockito.verify(filenameScrapingRuleRepository, Mockito.times(1)).saveAll(savedRules);
  }

  @Test
  public void testLoadFilenameMetadata() {
    Mockito.when(filenameScrapingRuleRepository.findAll()).thenReturn(filenameScrapingRuleList);
    Mockito.when(
            filenameScraperAdaptor.execute(
                Mockito.anyString(), Mockito.any(FilenameScrapingRule.class)))
        .thenReturn(filenameMetadata);
    Mockito.when(filenameMetadata.isFound()).thenReturn(true);

    final FilenameMetadata result = service.loadFilenameMetadata(TEST_FILENAME);

    assertNotNull(result);
    assertSame(filenameMetadata, result);

    Mockito.verify(filenameScraperAdaptor, Mockito.times(1))
        .execute(TEST_FILENAME, filenameScrapingRule);
  }

  @Test
  public void testLoadFilenameMetadataNotLoaded() {
    Mockito.when(filenameScrapingRuleRepository.findAll()).thenReturn(filenameScrapingRuleList);
    Mockito.when(
            filenameScraperAdaptor.execute(
                Mockito.anyString(), Mockito.any(FilenameScrapingRule.class)))
        .thenReturn(filenameMetadata);
    Mockito.when(filenameMetadata.isFound()).thenReturn(false);

    final FilenameMetadata result = service.loadFilenameMetadata(TEST_FILENAME);

    assertNotNull(result);
    assertNotSame(filenameMetadata, result);
    assertFalse(result.isFound());

    Mockito.verify(filenameScraperAdaptor, Mockito.times(1))
        .execute(TEST_FILENAME, filenameScrapingRule);
  }
}
