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

import java.util.ArrayList;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.adaptors.comicbooks.FilenameScraperAdaptor;
import org.comixedproject.model.metadata.FilenameMetadata;
import org.comixedproject.model.metadata.FilenameScrapingRule;
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
  @Autowired private FilenameScrapingRuleRepository filenameScrapingRuleRepository;
  @Autowired private FilenameScraperAdaptor filenameScraperAdaptor;

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
}
