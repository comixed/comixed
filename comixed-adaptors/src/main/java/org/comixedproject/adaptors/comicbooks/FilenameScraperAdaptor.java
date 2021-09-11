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

package org.comixedproject.adaptors.comicbooks;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.regex.Pattern;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.lang.StringUtils;
import org.comixedproject.adaptors.AdaptorException;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.scraping.ScrapingRule;
import org.springframework.stereotype.Component;

/**
 * <code>FilenameScraperAdaptor</code> scrapes comic meta-information from the filename for a comic.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class FilenameScraperAdaptor {
  /**
   * Sets the meta-information on the comic based on the comic's filename.
   *
   * @param comic the comic to be updated @Param rule the filename scraping rule
   * @throws AdaptorException if an error occurs
   * @return
   */
  public boolean execute(final Comic comic, final ScrapingRule scrapingRule)
      throws AdaptorException {
    log.debug(
        "Applying filename scraping rule: filename={} rule={}",
        FilenameUtils.getName(comic.getFilename()),
        scrapingRule.getRule());
    return this.applyRule(comic, scrapingRule);
  }

  private boolean applyRule(Comic comic, ScrapingRule scrapingRule) throws AdaptorException {
    var expression = Pattern.compile(scrapingRule.getRule());
    var filename = FilenameUtils.getBaseName(comic.getFilename());

    if (this.ruleApplies(expression, filename)) {
      log.debug("Rule applies");
      String[] elements = this.extractElements(expression, filename);
      if (scrapingRule.getCoverDatePosition() != null
          && !StringUtils.isEmpty(scrapingRule.getDateFormat())) {
        try {
          this.parseCoverDate(comic, scrapingRule, elements[scrapingRule.getCoverDatePosition()]);
        } catch (ParseException error) {
          throw new AdaptorException("Failed to parse cover date", error);
        }
      }
      if (scrapingRule.getSeriesPosition() != null) {
        comic.setSeries(elements[scrapingRule.getSeriesPosition()]);
      }
      if (scrapingRule.getVolumePosition() != null) {
        comic.setVolume(elements[scrapingRule.getVolumePosition()]);
      }
      if (scrapingRule.getIssueNumberPosition() != null) {
        comic.setIssueNumber(elements[scrapingRule.getIssueNumberPosition()]);
      }
      return true;
    } else {
      log.debug("Rule does not apply");
      return false;
    }
  }

  private boolean ruleApplies(final Pattern expression, final String filename) {
    log.trace("Checking if filename matches scraping pattern");
    return expression.matcher(filename).matches();
  }

  private String[] extractElements(final Pattern expression, final String filename) {
    log.trace("Extracting scraping elements from filename");
    var matches = expression.matcher(filename);
    var result = new String[matches.groupCount() + 1];

    while (matches.find()) {
      for (var index = 0; index < result.length; index++) {
        result[index] = matches.group(index);
        log.debug("Setting index={} to {}", index, result[index]);
      }
    }

    return result;
  }

  private void parseCoverDate(
      final Comic comic, final ScrapingRule scrapingRule, final String coverDate)
      throws ParseException {
    var dateFormat = new SimpleDateFormat(scrapingRule.getDateFormat());
    comic.setCoverDate(dateFormat.parse(coverDate));
  }
}
