/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project.
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

import java.text.SimpleDateFormat;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.comicbooks.ComicState;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * <code>ComicMetadataAdaptor</code> provides methods that work with the metadata of a comic book.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class ComicMetadataAdaptor {
  public static final String UNNAMED_SERIES = "[Unnamed Series]";
  public static final String MISSING_VOLUME = "----";
  public static final String NO_COVER_DATE = "??/??";
  public static final String MISSING_ISSUE_NUMBER = "##";
  static final Object CHANGED_COMIC_MARKER = "[!]";
  final SimpleDateFormat coverDateFormat = new SimpleDateFormat("MMM yyyy");

  /**
   * Clears all metadata scraped from a remove database.
   *
   * @param comic the comic
   */
  public void clear(Comic comic) {
    comic.setMetadata(null);
    comic.setWebAddress("");
    comic.setPublisher("");
    comic.setImprint("");
    comic.setSeries("");
    comic.setVolume("");
    comic.setIssueNumber("");
    comic.setCoverDate(null);
    comic.setTitle("");
    comic.setDescription("");
    comic.getTags().clear();
  }

  /**
   * Returns a displayable title for a comic book.
   *
   * @param comicBook the comic book
   * @return the title
   */
  public String getDisplayableTitle(final Comic comicBook) {
    log.trace("Getting cover date");
    final String coverDate =
        comicBook.getCoverDate() != null
            ? this.coverDateFormat.format(comicBook.getCoverDate())
            : NO_COVER_DATE;
    final String series =
        StringUtils.hasLength(comicBook.getSeries()) ? comicBook.getSeries() : UNNAMED_SERIES;
    final String volume =
        StringUtils.hasLength(comicBook.getVolume()) ? comicBook.getVolume() : MISSING_VOLUME;
    final String issueNumber =
        StringUtils.hasLength(comicBook.getIssueNumber())
            ? comicBook.getIssueNumber()
            : MISSING_ISSUE_NUMBER;
    log.trace("Assembling displayable title");
    return String.format(
            "%s v%s #%s (%s) %s",
            series,
            volume,
            issueNumber,
            coverDate,
            comicBook.getState() == ComicState.CHANGED ? CHANGED_COMIC_MARKER : "")
        .trim();
  }
}
