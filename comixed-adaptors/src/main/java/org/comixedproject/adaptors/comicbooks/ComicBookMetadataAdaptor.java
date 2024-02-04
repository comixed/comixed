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
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.model.comicbooks.ComicState;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * <code>ComicBookMetadataAdaptor</code> provides methods that work with the metadata of a comic
 * book.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class ComicBookMetadataAdaptor {
  public static final String UNNAMED_SERIES = "[Unnamed Series]";
  public static final String MISSING_VOLUME = "----";
  public static final String NO_COVER_DATE = "??/??";
  public static final String MISSING_ISSUE_NUMBER = "##";
  static final Object CHANGED_COMIC_MARKER = "[!]";
  final SimpleDateFormat coverDateFormat = new SimpleDateFormat("MMM yyyy");

  /**
   * Clears all metadata scraped from a remove database.
   *
   * @param comicBook the comicBook
   */
  public void clear(ComicBook comicBook) {
    comicBook.setMetadata(null);
    final ComicDetail detail = comicBook.getComicDetail();
    detail.setPublisher("");
    detail.setImprint("");
    detail.setSeries("");
    detail.setVolume("");
    detail.setIssueNumber("");
    detail.setCoverDate(null);
    detail.setTitle("");
    detail.setDescription("");
    detail.getTags().clear();
  }

  /**
   * Returns a displayable title for a comic book.
   *
   * @param comicBook the comic book
   * @return the title
   */
  public String getDisplayableTitle(final ComicDetail comicBook) {
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
            comicBook.getComicState() == ComicState.CHANGED ? CHANGED_COMIC_MARKER : "")
        .trim();
  }
}
