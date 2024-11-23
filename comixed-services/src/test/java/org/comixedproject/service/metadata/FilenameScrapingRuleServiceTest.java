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

package org.comixedproject.service.metadata;

import static junit.framework.TestCase.*;
import static org.comixedproject.service.metadata.FilenameScrapingRuleService.*;
import static org.junit.Assert.assertArrayEquals;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import org.comixedproject.adaptors.comicbooks.FilenameScraperAdaptor;
import org.comixedproject.adaptors.csv.CsvAdaptor;
import org.comixedproject.adaptors.csv.CsvRowDecoder;
import org.comixedproject.adaptors.csv.CsvRowEncoder;
import org.comixedproject.model.metadata.FilenameMetadata;
import org.comixedproject.model.metadata.FilenameScrapingRule;
import org.comixedproject.repositories.metadata.FilenameScrapingRuleRepository;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class FilenameScrapingRuleServiceTest {
  private static final Integer TEST_PRIORITY = 0;
  private static final String TEST_NAME = "Rule name";
  private static final String TEST_RULE = "Rule value";
  private static final Integer TEST_SERIES_POSITION = 1;
  private static final Integer TEST_VOLUME_POSITION = 2;
  private static final Integer TEST_ISSUE_NUMBER_POSITION = 3;
  private static final Integer TEST_COVER_DATE_POSITION = 4;
  private static final String TEST_DATE_FORMAT = "The date format";
  private static final String TEST_FILENAME = "The filename";
  private static final byte[] TEST_ENCODED_ROW = "The encoded row data".getBytes();

  @InjectMocks private FilenameScrapingRuleService service;
  @Mock private FilenameScrapingRuleRepository filenameScrapingRuleRepository;
  @Mock private FilenameScraperAdaptor filenameScraperAdaptor;
  @Mock private CsvAdaptor csvAdaptor;
  @Mock private List<FilenameScrapingRule> savedRuleList;
  @Mock private FilenameScrapingRule filenameScrapingRule;
  @Mock private FilenameMetadata filenameMetadata;
  @Mock private InputStream inputStream;

  @Captor private ArgumentCaptor<List<FilenameScrapingRule>> saveAllRulesListArgumentCaptor;
  @Captor private ArgumentCaptor<CsvRowEncoder> rowEncoderArgumentCaptor;
  @Captor private ArgumentCaptor<CsvRowDecoder> csvRowDecoderArgumentCaptor;

  private List<FilenameScrapingRule> filenameScrapingRuleList = new ArrayList<>();
  private List<String> decodedRow = new ArrayList<>();

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
    Mockito.when(filenameScrapingRuleRepository.findAll()).thenReturn(filenameScrapingRuleList);

    decodedRow.add(TEST_NAME);
    decodedRow.add(TEST_RULE);
    decodedRow.add(TEST_SERIES_POSITION.toString());
    decodedRow.add(TEST_VOLUME_POSITION.toString());
    decodedRow.add(TEST_ISSUE_NUMBER_POSITION.toString());
    decodedRow.add(TEST_COVER_DATE_POSITION.toString());
    decodedRow.add(TEST_DATE_FORMAT);
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
    Mockito.when(filenameScrapingRuleRepository.saveAll(saveAllRulesListArgumentCaptor.capture()))
        .thenReturn(savedRuleList);

    final List<FilenameScrapingRule> result = service.saveRules(filenameScrapingRuleList);

    assertNotNull(result);
    assertSame(savedRuleList, result);

    final List<FilenameScrapingRule> savedRules = saveAllRulesListArgumentCaptor.getValue();
    assertNotNull(savedRules);
    assertFalse(savedRules.isEmpty());

    final FilenameScrapingRule created = savedRules.get(0);
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
  public void testLoadFilenameMetadata_notLoaded() {
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

  @Test(expected = FilenameScrapingRuleException.class)
  public void testGetFilenameRulesFile_encodeRecordThrowsException()
      throws IOException, FilenameScrapingRuleException {
    filenameScrapingRuleList.add(filenameScrapingRule);

    Mockito.when(csvAdaptor.encodeRecords(Mockito.anyList(), rowEncoderArgumentCaptor.capture()))
        .thenThrow(IOException.class);

    try {
      service.getFilenameScrapingRulesFile();
    } finally {
      Mockito.verify(filenameScrapingRuleRepository, Mockito.times(1)).findAll();
    }
  }

  @Test
  public void testGetFilenameRulesFile_noSeriesPosition()
      throws IOException, FilenameScrapingRuleException {
    Mockito.when(filenameScrapingRule.getSeriesPosition()).thenReturn(null);

    filenameScrapingRuleList.add(filenameScrapingRule);

    Mockito.when(csvAdaptor.encodeRecords(Mockito.anyList(), rowEncoderArgumentCaptor.capture()))
        .thenReturn(TEST_ENCODED_ROW);

    service.getFilenameScrapingRulesFile();

    final CsvRowEncoder encoder = rowEncoderArgumentCaptor.getValue();
    String[] row = encoder.createRow(0, filenameScrapingRule);
    assertArrayEquals(
        new String[] {
          RULE_NAME_HEADER,
          RULE_CONTENT_HEADER,
          SERIES_POSITION_HEADER,
          VOLUME_POSITION_HEADER,
          ISSUE_NUMBER_POSITION_HEADER,
          COVER_DATE_POSITION_HEADER,
          COVER_DATE_FORMAT_HEADER
        },
        row);
    row = encoder.createRow(1, filenameScrapingRule);
    assertArrayEquals(
        new String[] {
          TEST_NAME,
          TEST_RULE,
          "",
          String.valueOf(TEST_VOLUME_POSITION),
          String.valueOf(TEST_ISSUE_NUMBER_POSITION),
          String.valueOf(TEST_COVER_DATE_POSITION),
          TEST_DATE_FORMAT
        },
        row);

    Mockito.verify(filenameScrapingRuleRepository, Mockito.times(1)).findAll();
  }

  @Test
  public void testGetFilenameRulesFile_noVolumePosition()
      throws IOException, FilenameScrapingRuleException {
    Mockito.when(filenameScrapingRule.getVolumePosition()).thenReturn(null);

    filenameScrapingRuleList.add(filenameScrapingRule);

    Mockito.when(csvAdaptor.encodeRecords(Mockito.anyList(), rowEncoderArgumentCaptor.capture()))
        .thenReturn(TEST_ENCODED_ROW);

    service.getFilenameScrapingRulesFile();

    final CsvRowEncoder encoder = rowEncoderArgumentCaptor.getValue();
    String[] row = encoder.createRow(0, filenameScrapingRule);
    assertArrayEquals(
        new String[] {
          RULE_NAME_HEADER,
          RULE_CONTENT_HEADER,
          SERIES_POSITION_HEADER,
          VOLUME_POSITION_HEADER,
          ISSUE_NUMBER_POSITION_HEADER,
          COVER_DATE_POSITION_HEADER,
          COVER_DATE_FORMAT_HEADER
        },
        row);
    row = encoder.createRow(1, filenameScrapingRule);
    assertArrayEquals(
        new String[] {
          TEST_NAME,
          TEST_RULE,
          String.valueOf(TEST_SERIES_POSITION),
          "",
          String.valueOf(TEST_ISSUE_NUMBER_POSITION),
          String.valueOf(TEST_COVER_DATE_POSITION),
          TEST_DATE_FORMAT
        },
        row);

    Mockito.verify(filenameScrapingRuleRepository, Mockito.times(1)).findAll();
  }

  @Test
  public void testGetFilenameRulesFile_noIssueNumberPosition()
      throws IOException, FilenameScrapingRuleException {
    Mockito.when(filenameScrapingRule.getIssueNumberPosition()).thenReturn(null);

    filenameScrapingRuleList.add(filenameScrapingRule);

    Mockito.when(csvAdaptor.encodeRecords(Mockito.anyList(), rowEncoderArgumentCaptor.capture()))
        .thenReturn(TEST_ENCODED_ROW);

    service.getFilenameScrapingRulesFile();

    final CsvRowEncoder encoder = rowEncoderArgumentCaptor.getValue();
    String[] row = encoder.createRow(0, filenameScrapingRule);
    assertArrayEquals(
        new String[] {
          RULE_NAME_HEADER,
          RULE_CONTENT_HEADER,
          SERIES_POSITION_HEADER,
          VOLUME_POSITION_HEADER,
          ISSUE_NUMBER_POSITION_HEADER,
          COVER_DATE_POSITION_HEADER,
          COVER_DATE_FORMAT_HEADER
        },
        row);
    row = encoder.createRow(1, filenameScrapingRule);
    assertArrayEquals(
        new String[] {
          TEST_NAME,
          TEST_RULE,
          String.valueOf(TEST_SERIES_POSITION),
          String.valueOf(TEST_VOLUME_POSITION),
          "",
          String.valueOf(TEST_COVER_DATE_POSITION),
          TEST_DATE_FORMAT
        },
        row);

    Mockito.verify(filenameScrapingRuleRepository, Mockito.times(1)).findAll();
  }

  @Test
  public void testGetFilenameRulesFile_noCoverDatePosition()
      throws IOException, FilenameScrapingRuleException {
    Mockito.when(filenameScrapingRule.getCoverDatePosition()).thenReturn(null);

    filenameScrapingRuleList.add(filenameScrapingRule);

    Mockito.when(csvAdaptor.encodeRecords(Mockito.anyList(), rowEncoderArgumentCaptor.capture()))
        .thenReturn(TEST_ENCODED_ROW);

    service.getFilenameScrapingRulesFile();

    final CsvRowEncoder encoder = rowEncoderArgumentCaptor.getValue();
    String[] row = encoder.createRow(0, filenameScrapingRule);
    assertArrayEquals(
        new String[] {
          RULE_NAME_HEADER,
          RULE_CONTENT_HEADER,
          SERIES_POSITION_HEADER,
          VOLUME_POSITION_HEADER,
          ISSUE_NUMBER_POSITION_HEADER,
          COVER_DATE_POSITION_HEADER,
          COVER_DATE_FORMAT_HEADER
        },
        row);
    row = encoder.createRow(1, filenameScrapingRule);
    assertArrayEquals(
        new String[] {
          TEST_NAME,
          TEST_RULE,
          String.valueOf(TEST_SERIES_POSITION),
          String.valueOf(TEST_VOLUME_POSITION),
          String.valueOf(TEST_ISSUE_NUMBER_POSITION),
          "",
          TEST_DATE_FORMAT
        },
        row);

    Mockito.verify(filenameScrapingRuleRepository, Mockito.times(1)).findAll();
  }

  @Test
  public void testGetFilenameRulesFile() throws IOException, FilenameScrapingRuleException {
    filenameScrapingRuleList.add(filenameScrapingRule);

    Mockito.when(csvAdaptor.encodeRecords(Mockito.anyList(), rowEncoderArgumentCaptor.capture()))
        .thenReturn(TEST_ENCODED_ROW);

    service.getFilenameScrapingRulesFile();

    final CsvRowEncoder encoder = rowEncoderArgumentCaptor.getValue();
    String[] row = encoder.createRow(0, filenameScrapingRule);
    assertArrayEquals(
        new String[] {
          RULE_NAME_HEADER,
          RULE_CONTENT_HEADER,
          SERIES_POSITION_HEADER,
          VOLUME_POSITION_HEADER,
          ISSUE_NUMBER_POSITION_HEADER,
          COVER_DATE_POSITION_HEADER,
          COVER_DATE_FORMAT_HEADER
        },
        row);
    row = encoder.createRow(1, filenameScrapingRule);
    assertArrayEquals(
        new String[] {
          TEST_NAME,
          TEST_RULE,
          String.valueOf(TEST_SERIES_POSITION),
          String.valueOf(TEST_VOLUME_POSITION),
          String.valueOf(TEST_ISSUE_NUMBER_POSITION),
          String.valueOf(TEST_COVER_DATE_POSITION),
          TEST_DATE_FORMAT
        },
        row);

    Mockito.verify(filenameScrapingRuleRepository, Mockito.times(1)).findAll();
  }

  @Test
  public void testUploadFile_noExistingRecords() throws IOException {
    filenameScrapingRuleList.clear();

    Mockito.when(filenameScrapingRuleRepository.findAll()).thenReturn(filenameScrapingRuleList);
    Mockito.doNothing()
        .when(csvAdaptor)
        .decodeRecords(
            Mockito.any(InputStream.class), Mockito.any(), csvRowDecoderArgumentCaptor.capture());
    Mockito.when(filenameScrapingRuleRepository.saveAll(saveAllRulesListArgumentCaptor.capture()))
        .thenReturn(savedRuleList);

    final List<FilenameScrapingRule> result = service.uploadFile(inputStream);

    assertNotNull(result);
    assertSame(savedRuleList, result);

    csvRowDecoderArgumentCaptor.getValue().processRow(1, decodedRow);
    final List<FilenameScrapingRule> ruleList = saveAllRulesListArgumentCaptor.getValue();
    assertNotNull(ruleList);

    Mockito.verify(filenameScrapingRuleRepository, Mockito.times(1)).findAll();
    Mockito.verify(csvAdaptor, Mockito.times(1))
        .decodeRecords(
            inputStream,
            new String[] {
              RULE_NAME_HEADER,
              RULE_CONTENT_HEADER,
              SERIES_POSITION_HEADER,
              VOLUME_POSITION_HEADER,
              ISSUE_NUMBER_POSITION_HEADER,
              COVER_DATE_POSITION_HEADER,
              COVER_DATE_FORMAT_HEADER
            },
            csvRowDecoderArgumentCaptor.getValue());
    Mockito.verify(filenameScrapingRuleRepository, Mockito.times(1)).saveAll(ruleList);
  }

  @Test
  public void testUploadFile() throws IOException {
    Mockito.when(filenameScrapingRuleRepository.findAll()).thenReturn(filenameScrapingRuleList);
    Mockito.doNothing()
        .when(csvAdaptor)
        .decodeRecords(
            Mockito.any(InputStream.class), Mockito.any(), csvRowDecoderArgumentCaptor.capture());
    Mockito.when(filenameScrapingRuleRepository.saveAll(saveAllRulesListArgumentCaptor.capture()))
        .thenReturn(savedRuleList);

    final List<FilenameScrapingRule> result = service.uploadFile(inputStream);

    assertNotNull(result);
    assertSame(savedRuleList, result);

    csvRowDecoderArgumentCaptor.getValue().processRow(1, decodedRow);
    final List<FilenameScrapingRule> ruleList = saveAllRulesListArgumentCaptor.getValue();
    assertNotNull(ruleList);
    assertEquals(TEST_NAME, ruleList.get(0).getName());
    assertEquals(TEST_RULE, ruleList.get(0).getRule());
    assertEquals(TEST_SERIES_POSITION, ruleList.get(0).getSeriesPosition());
    assertEquals(TEST_VOLUME_POSITION, ruleList.get(0).getVolumePosition());
    assertEquals(TEST_ISSUE_NUMBER_POSITION, ruleList.get(0).getIssueNumberPosition());
    assertEquals(TEST_COVER_DATE_POSITION, ruleList.get(0).getCoverDatePosition());
    assertEquals(TEST_DATE_FORMAT, ruleList.get(0).getDateFormat());

    Mockito.verify(filenameScrapingRuleRepository, Mockito.times(1)).findAll();
    Mockito.verify(csvAdaptor, Mockito.times(1))
        .decodeRecords(
            inputStream,
            new String[] {
              RULE_NAME_HEADER,
              RULE_CONTENT_HEADER,
              SERIES_POSITION_HEADER,
              VOLUME_POSITION_HEADER,
              ISSUE_NUMBER_POSITION_HEADER,
              COVER_DATE_POSITION_HEADER,
              COVER_DATE_FORMAT_HEADER
            },
            csvRowDecoderArgumentCaptor.getValue());
    Mockito.verify(filenameScrapingRuleRepository, Mockito.times(1)).saveAll(ruleList);
  }
}
