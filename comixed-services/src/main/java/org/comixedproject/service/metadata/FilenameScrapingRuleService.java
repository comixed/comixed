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

import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.lang.time.DateFormatUtils;
import org.comixedproject.adaptors.comicbooks.FilenameScraperAdaptor;
import org.comixedproject.adaptors.csv.CsvAdaptor;
import org.comixedproject.model.metadata.FilenameMetadata;
import org.comixedproject.model.metadata.FilenameScrapingRule;
import org.comixedproject.model.net.DownloadDocument;
import org.comixedproject.repositories.metadata.FilenameScrapingRuleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * <code>FilenameScrapingRuleService</code> provides business rules for working with instances of
 * {@link FilenameScrapingRule}.
 *
 * @author Darryl L. Pierce
 */
@Service
@Log4j2
public class FilenameScrapingRuleService {
  static final String RULE_NUMBER_HEADER = "#";
  static final String RULE_NAME_HEADER = "Name";
  static final String RULE_CONTENT_HEADER = "Rule";
  static final String SERIES_POSITION_HEADER = "Series Position";
  static final String VOLUME_POSITION_HEADER = "Volume Position";
  static final String ISSUE_NUMBER_POSITION_HEADER = "Issue # Position";
  static final String COVER_DATE_POSITION_HEADER = "Cover Date Position";
  static final String COVER_DATE_FORMAT_HEADER = "Cover Date Format";

  @Autowired private FilenameScrapingRuleRepository filenameScrapingRuleRepository;
  @Autowired private FilenameScraperAdaptor filenameScraperAdaptor;
  @Autowired private CsvAdaptor csvAdaptor;

  /**
   * Returns all rules, sorted by priority.
   *
   * @return the sorted rules
   */
  public List<FilenameScrapingRule> loadRules() {
    log.trace("Loading all filename scraping rules");
    return this.filenameScrapingRuleRepository.findAll();
  }

  /**
   * Saves the new filename scraping rule list.
   *
   * @param incoming the new rules
   * @return the saved rules
   */
  @Transactional
  public List<FilenameScrapingRule> saveRules(final List<FilenameScrapingRule> incoming) {
    log.trace("Deleting existing filename scraping rules");
    this.filenameScrapingRuleRepository.deleteAll();
    this.filenameScrapingRuleRepository.flush();
    log.trace("Copying filename scraping rule values");
    List<FilenameScrapingRule> rules = new ArrayList<>();
    incoming.forEach(
        filenameScrapingRule -> {
          final FilenameScrapingRule rule =
              new FilenameScrapingRule(
                  filenameScrapingRule.getName(),
                  filenameScrapingRule.getRule(),
                  filenameScrapingRule.getPriority());
          rule.setSeriesPosition(filenameScrapingRule.getSeriesPosition());
          rule.setVolumePosition(filenameScrapingRule.getVolumePosition());
          rule.setIssueNumberPosition(filenameScrapingRule.getIssueNumberPosition());
          rule.setCoverDatePosition(filenameScrapingRule.getCoverDatePosition());
          rule.setDateFormat(filenameScrapingRule.getDateFormat());
          rules.add(rule);
        });
    log.trace("Saving new filename scrapign rules");
    return this.filenameScrapingRuleRepository.saveAll(rules);
  }

  /**
   * Attempts to load metadata from a filename.
   *
   * @param filename the filename
   * @return the metadata
   */
  public FilenameMetadata loadFilenameMetadata(final String filename) {
    log.trace("Loading filename scraping rules");
    final List<FilenameScrapingRule> rules = this.loadRules();
    for (FilenameScrapingRule rule : rules) {
      log.trace("Testing filename scraping rule: priority={}", rule.getPriority());
      final FilenameMetadata result = this.filenameScraperAdaptor.execute(filename, rule);
      if (result.isFound()) {
        log.trace("Rule applied!");
        return result;
      }
    }
    log.trace("No applicable rule found");
    return new FilenameMetadata();
  }

  /**
   * Encodes the filename scraping rules as a CSV stream.
   *
   * @return the document
   * @throws FilenameScrapingRuleException if an error occurs
   */
  public DownloadDocument getFilenameScrapingRulesFile() throws FilenameScrapingRuleException {
    log.debug("Retrieving blocked pages");
    final List<FilenameScrapingRule> entries = this.filenameScrapingRuleRepository.findAll();
    try {
      final byte[] content =
          this.csvAdaptor.encodeRecords(
              entries,
              (index, model) -> {
                if (index == 0) {
                  return new String[] {
                    RULE_NUMBER_HEADER,
                    RULE_NAME_HEADER,
                    RULE_CONTENT_HEADER,
                    SERIES_POSITION_HEADER,
                    VOLUME_POSITION_HEADER,
                    ISSUE_NUMBER_POSITION_HEADER,
                    COVER_DATE_POSITION_HEADER,
                    COVER_DATE_FORMAT_HEADER
                  };
                } else {
                  return new String[] {
                    String.valueOf(model.getPriority()),
                    model.getName(),
                    model.getRule(),
                    model.getSeriesPosition() != null
                        ? String.valueOf(model.getSeriesPosition())
                        : "",
                    model.getVolumePosition() != null
                        ? String.valueOf(model.getVolumePosition())
                        : "",
                    model.getIssueNumberPosition() != null
                        ? String.valueOf(model.getIssueNumberPosition())
                        : "",
                    model.getCoverDatePosition() != null
                        ? String.valueOf(model.getCoverDatePosition())
                        : "",
                    model.getDateFormat()
                  };
                }
              });
      return new DownloadDocument(
          String.format(
              "ComiXed Filename Scraping Rules As Of %s.csv",
              DateFormatUtils.format(new Date(), "yyyy-MM-dd")),
          "text/csv",
          content);
    } catch (IOException error) {
      throw new FilenameScrapingRuleException("Failed to encoding filename rules file", error);
    }
  }
}
