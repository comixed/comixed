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
import java.util.Date;
import java.util.regex.Pattern;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.lang.StringUtils;
import org.comixedproject.model.scraping.FilenameMetadata;
import org.comixedproject.model.scraping.FilenameScrapingRule;
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
   * Attempts to set the metadata on a comic based on the comic's filename.
   *
   * @param filename the filename
   * @param filenameScrapingRule the scraping rule
   * @return the filename metadata if the rule was applied, otherwise null
   */
  public FilenameMetadata execute(
      final String filename, final FilenameScrapingRule filenameScrapingRule) {
    log.trace(
        "Applying filename scraping rule: filename={} rule={}",
        filename,
        filenameScrapingRule.getRule());
    return this.applyRule(filename, filenameScrapingRule);
  }

  private FilenameMetadata applyRule(
      final String filename, final FilenameScrapingRule filenameScrapingRule) {
    var expression = Pattern.compile(filenameScrapingRule.getRule());

    if (this.ruleApplies(expression, filename)) {
      log.trace("Rule applies");
      String[] elements = this.extractElements(expression, filename);
      String series = null;
      String volume = null;
      String issueNumber = null;
      Date coverDate = null;

      if (filenameScrapingRule.getCoverDatePosition() != null
          && !StringUtils.isEmpty(filenameScrapingRule.getDateFormat())) {
        try {
          final SimpleDateFormat dateFormat =
              new SimpleDateFormat(filenameScrapingRule.getDateFormat());
          coverDate = dateFormat.parse(elements[filenameScrapingRule.getCoverDatePosition()]);
        } catch (ParseException error) {
          log.error("Failed to parse cover date", error);
          coverDate = null;
        }
      }

      if (filenameScrapingRule.getSeriesPosition() != null) {
        series = elements[filenameScrapingRule.getSeriesPosition()];
      }

      if (filenameScrapingRule.getVolumePosition() != null) {
        volume = elements[filenameScrapingRule.getVolumePosition()];
      }
      if (filenameScrapingRule.getIssueNumberPosition() != null)
        issueNumber = elements[filenameScrapingRule.getIssueNumberPosition()];

      return new FilenameMetadata(true, series, volume, issueNumber, coverDate);
    } else {
      log.trace("Rule does not apply");
      return new FilenameMetadata();
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
        log.trace("Setting index={} to {}", index, result[index]);
      }
    }

    return result;
  }
}
