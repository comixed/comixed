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

import static org.apache.commons.lang.StringUtils.leftPad;

import java.io.File;
import java.text.MessageFormat;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.GregorianCalendar;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.io.FilenameUtils;
import org.comixedproject.model.comicbooks.ComicBook;
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
  private static final String FORBIDDEN_PROPERTY_CHARACTERS = "[\"':\\\\/*?|<>{}:%]";
  static final String UNKNOWN_VALUE = "Unknown";
  public static final String NO_COVER_DATE = "No Cover Date";
  public static final String PLACEHOLDER_PUBLISHER = "$PUBLISHER";
  public static final String PLACEHOLDER_IMPRINT = "$IMPRINT";
  public static final String PLACEHOLDER_SERIES = "$SERIES";
  public static final String PLACEHOLDER_VOLUME = "$VOLUME";
  public static final String PLACEHOLDER_ISSUE_NUMBER = "$ISSUE";
  public static final String PLACEHOLDER_TITLE = "$TITLE";
  public static final String PLACEHOLDER_COVER_DATE = "$COVERDATE";
  public static final String PLACEHOLDER_PUBLISHED_YEAR = "$PUBYEAR";
  public static final String PLACEHOLDER_PUBLISHED_MONTH = "$PUBMONTH";

  private final SimpleDateFormat coverDateFormat = new SimpleDateFormat("MMM yyyy");

  /**
   * Looks for the next available filename for a comic file.
   *
   * @param originalFilename the original filename
   * @param filename the root filename
   * @param attempt the current attempt
   * @param extension the extension for the file
   * @return the filename to use
   */
  public String findAvailableFilename(
      final String originalFilename,
      final String filename,
      final int attempt,
      final String extension) {
    String candidate = null;

    if (attempt > 0) {
      candidate = MessageFormat.format("{0}-{1}.{2}", filename, attempt, extension);
    } else {
      candidate = MessageFormat.format("{0}.{1}", filename, extension);
    }

    var file = new File(candidate);
    if (file.exists() && StringUtils.pathEquals(originalFilename, candidate)) {
      log.debug("Using original filename: {}", originalFilename);
      return originalFilename;
    }
    return (!file.exists())
        ? candidate
        : findAvailableFilename(originalFilename, filename, attempt + 1, extension);
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
   * Generates a filename for the given comicBook based on the supplied rule.
   *
   * @param comicBook the comicBook
   * @param renamingRule the renaming rule
   * @param targetDirectory the target directory
   * @return the generated filename
   */
  public String createFilenameFromRule(
      final ComicBook comicBook, final String renamingRule, final String targetDirectory) {
    if (StringUtils.isEmpty(renamingRule)) {
      log.trace(
          "No renaming rules: using original filename: {}",
          FilenameUtils.getBaseName(comicBook.getComicDetail().getFilename()));
      return String.format(
          "%s/%s",
          targetDirectory, FilenameUtils.getBaseName(comicBook.getComicDetail().getFilename()));
    }

    log.trace("Scrubbing renaming rule: {}", renamingRule);
    final String rule = this.scrub(renamingRule, FORBIDDEN_RULE_CHARACTERS);

    log.trace("Generating relative filename based on renaming rule: {}", rule);
    final String publisher =
        StringUtils.hasLength(comicBook.getComicDetail().getPublisher())
            ? scrub(comicBook.getComicDetail().getPublisher())
            : UNKNOWN_VALUE;
    final String imprint =
        StringUtils.hasLength(comicBook.getComicDetail().getImprint())
            ? scrub(comicBook.getComicDetail().getImprint())
            : UNKNOWN_VALUE;
    final String series =
        StringUtils.hasLength(comicBook.getComicDetail().getSeries())
            ? scrub(comicBook.getComicDetail().getSeries())
            : UNKNOWN_VALUE;
    final String volume =
        StringUtils.hasLength(comicBook.getComicDetail().getVolume())
            ? comicBook.getComicDetail().getVolume()
            : UNKNOWN_VALUE;
    final String title =
        StringUtils.hasLength(comicBook.getComicDetail().getTitle())
            ? comicBook.getComicDetail().getTitle()
            : UNKNOWN_VALUE;
    String issueNumber =
        StringUtils.hasLength(comicBook.getComicDetail().getIssueNumber())
            ? scrub(comicBook.getComicDetail().getIssueNumber())
            : UNKNOWN_VALUE;
    final String coverDate =
        comicBook.getComicDetail().getCoverDate() != null
            ? coverDateFormat.format(comicBook.getComicDetail().getCoverDate())
            : NO_COVER_DATE;
    issueNumber = this.checkForPadding(rule, PLACEHOLDER_ISSUE_NUMBER, issueNumber);
    String publishedMonth = "";
    String publishedYear = "";
    if (comicBook.getComicDetail().getStoreDate() != null) {
      final GregorianCalendar calendar = new GregorianCalendar();
      calendar.setTime(comicBook.getComicDetail().getStoreDate());
      log.trace("Getting store year");
      publishedYear = String.valueOf(calendar.get(Calendar.YEAR));
      log.trace("Getting store month");
      publishedMonth = String.valueOf(calendar.get(Calendar.MONTH));
    }

    String result =
        rule.replace(PLACEHOLDER_PUBLISHER, publisher)
            .replace(PLACEHOLDER_IMPRINT, imprint)
            .replace(PLACEHOLDER_SERIES, series)
            .replace(PLACEHOLDER_VOLUME, volume)
            .replace(PLACEHOLDER_TITLE, title)
            .replaceAll(
                // need to look for the longer version of the regex first
                String.format(
                    "(\\%s\\([\\d]+\\)|\\%s)", PLACEHOLDER_ISSUE_NUMBER, PLACEHOLDER_ISSUE_NUMBER),
                issueNumber)
            .replace(PLACEHOLDER_COVER_DATE, coverDate)
            .replace(PLACEHOLDER_PUBLISHED_YEAR, publishedYear)
            .replace(PLACEHOLDER_PUBLISHED_MONTH, publishedMonth);
    final String directory = FilenameUtils.getPath(result);
    final String filename = FilenameUtils.getName(result);

    result =
        FilenameUtils.normalize(
            String.format(
                "%s%s%s%s%s",
                targetDirectory,
                File.separator,
                directory,
                File.separator,
                sanitizeFilename(filename)));
    log.trace("Relative comicBook filename: {}", result);
    return result;
  }

  private String sanitizeFilename(final String filename) {
    return filename
        .trim()
        .replaceAll("[\\.|\\/|\\\\|\\*|\\:|\\||\"|\'|\\<|\\>|\\{|\\}|\\?|\\%|,]", "_")
        .replaceAll("\\s+", " ");
  }

  private String checkForPadding(final String rule, final String placeholder, final String value) {
    log.trace(
        "Checking if value needs padding: rule={} placeholder={} value={}",
        rule,
        placeholder,
        value);
    final Pattern pattern = Pattern.compile(String.format(".*(\\%s\\([\\d]+\\)).*", placeholder));
    final Matcher matcher = pattern.matcher(rule);
    if (matcher.find()) {
      log.trace("Extracting full placeholder");
      final String fullValue = matcher.group(1);
      final int length =
          Integer.parseInt(fullValue.substring(fullValue.indexOf("(") + 1, fullValue.length() - 1));
      return leftPad(value, length, "0");
    } else {
      log.trace("Not padding value");
      return value;
    }
  }

  private String scrub(final String text) {
    return this.scrub(text, FORBIDDEN_PROPERTY_CHARACTERS);
  }

  private String scrub(final String text, final String forbidden) {
    log.trace("Pre-sanitized text: {}", text);
    return text.replaceAll(forbidden, "_");
  }
}
