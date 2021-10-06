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

import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.adaptors.comicbooks.FilenameScraperAdaptor;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.scraping.FilenameMetadata;
import org.comixedproject.model.scraping.ScrapingRule;
import org.comixedproject.repositories.scraping.ScrapingRuleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * <code>ScrapingRuleService</code> provides business rules for working with instances of {@link
 * ScrapingRule}.
 *
 * @author Darryl L. Pierce
 */
@Service
@Log4j2
public class ScrapingRuleService {
  @Autowired private ScrapingRuleRepository scrapingRuleRepository;
  @Autowired private FilenameScraperAdaptor filenameScraperAdaptor;

  /**
   * Returns all rules, sorted by priority.
   *
   * @return the sorted rules
   */
  public List<ScrapingRule> getAllRules() {
    log.trace("Loading all filename scraping rules");
    return this.scrapingRuleRepository.findAll();
  }

  /**
   * Applies scraping rules to the comic's filename. Attemps each until one applies, or none apply.
   *
   * @param comic the comic
   */
  public void scrapeFilename(final Comic comic) {
    final FilenameMetadata info = this.getInfoFromFilename(comic.getBaseFilename());
    if (info != null) {
      log.trace("Applying extracted metadata");
      comic.setSeries(info.getSeries());
      comic.setVolume(info.getVolume());
      comic.setIssueNumber(info.getIssueNumber());
      comic.setCoverDate(info.getCoverDate());
    }
  }

  /**
   * Returns the metadata extracted from a filename.
   *
   * @param filename the filename
   * @return the metadata, or null if none could be extracted
   */
  public FilenameMetadata getInfoFromFilename(final String filename) {
    log.trace("Loading scraping rules");
    final List<ScrapingRule> rules = this.getAllRules();
    for (int index = 0; index < rules.size(); index++) {
      final FilenameMetadata info = this.filenameScraperAdaptor.execute(filename, rules.get(index));
      if (info != null) return info;
    }
    log.trace("No metadata could be extracted");
    return new FilenameMetadata();
  }
}
