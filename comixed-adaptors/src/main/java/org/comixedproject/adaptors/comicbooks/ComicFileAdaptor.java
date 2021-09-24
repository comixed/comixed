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

import java.io.File;
import java.text.MessageFormat;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.GregorianCalendar;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.io.FilenameUtils;
import org.comixedproject.model.comicbooks.Comic;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * <code>ComicFileAdaptor</code> provides a set of utility methods related to comic files and
 * filenames.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class ComicFileAdaptor {
  private static final String FORBIDDEN_RULE_CHARACTERS = "[\"':\\\\*?|<>]";
  private static final String FORBIDDEN_PROPERTY_CHARACTERS = "[\"':\\\\/*?|<>]";
  static final String UNKNOWN_VALUE = "Unknown";
  public static final String NO_COVER_DATE = "No Cover Date";

  private final SimpleDateFormat coverDateFormat = new SimpleDateFormat("MMM yyyy");

  /**
   * Looks for the next available filename for a comic file.
   *
   * @param filename the root filename
   * @param attempt the current attempt
   * @param defaultExtension the extension for the file
   * @return the filename to use
   */
  public String findAvailableFilename(
      final String filename, final int attempt, final String defaultExtension) {
    String candidate = null;

    if (attempt > 0) {
      candidate = MessageFormat.format("{0}-{1}.{2}", filename, attempt, defaultExtension);
    } else {
      candidate = MessageFormat.format("{0}.{1}", filename, defaultExtension);
    }

    var file = new File(candidate);
    return (!file.exists())
        ? candidate
        : findAvailableFilename(filename, attempt + 1, defaultExtension);
  }

  /**
   * Checks if the file is a comic file based on extension.
   *
   * @param file the file
   * @return true if it's comic file
   */
  public boolean isComicFile(File file) {
    String name = file.getName().toUpperCase();
    return (name.endsWith("CBZ") || name.endsWith("CBR") || name.endsWith("CB7"));
  }

  /**
   * Generates a filename for the given comic based on the supplied rule.
   *
   * @param comic the comic
   * @param renamingRule the renaming rule
   * @return the generated filename
   */
  public String createFilenameFromRule(final Comic comic, final String renamingRule) {
    if (StringUtils.isEmpty(renamingRule)) {
      log.trace(
          "No renaming rules: using original filename: {}",
          FilenameUtils.getBaseName(comic.getFilename()));
      return FilenameUtils.getBaseName(comic.getFilename());
    }

    log.trace("Scrubbing renaming rule: {}", renamingRule);
    final String rule = this.scrub(renamingRule, FORBIDDEN_RULE_CHARACTERS);

    log.trace("Generating relative filename based on renaming rule: {}", rule);
    final String publisher =
        StringUtils.isEmpty(comic.getPublisher()) ? UNKNOWN_VALUE : scrub(comic.getPublisher());
    final String series =
        StringUtils.isEmpty(comic.getSeries()) ? UNKNOWN_VALUE : scrub(comic.getSeries());
    final String volume =
        StringUtils.isEmpty(comic.getVolume()) ? UNKNOWN_VALUE : comic.getVolume();
    final String issueNumber =
        StringUtils.isEmpty(comic.getIssueNumber()) ? UNKNOWN_VALUE : scrub(comic.getIssueNumber());
    final String coverDate =
        comic.getCoverDate() != null ? coverDateFormat.format(comic.getCoverDate()) : NO_COVER_DATE;
    String publishedMonth = "";
    String publishedYear = "";
    if (comic.getStoreDate() != null) {
      final GregorianCalendar calendar = new GregorianCalendar();
      calendar.setTime(comic.getStoreDate());
      log.trace("Getting store year");
      publishedYear = String.valueOf(calendar.get(Calendar.YEAR));
      log.trace("Getting store month");
      publishedMonth = String.valueOf(calendar.get(Calendar.MONTH));
    }

    String result =
        rule.replace("$PUBLISHER", publisher)
            .replace("$SERIES", series)
            .replace("$VOLUME", volume)
            .replace("$ISSUE", issueNumber)
            .replace("$COVERDATE", coverDate)
            .replace("$PUBYEAR", publishedYear)
            .replace("$PUBMONTH", publishedMonth);

    log.trace("Relative comic filename: {}", result);

    return String.format("%s.%s", result, comic.getArchiveType().getExtension());
  }

  private String scrub(final String text) {
    return this.scrub(text, FORBIDDEN_PROPERTY_CHARACTERS);
  }

  private String scrub(final String text, final String forbidden) {
    log.trace("Pre-sanitized text: {}", text);
    return text.replaceAll(forbidden, "_");
  }
}
