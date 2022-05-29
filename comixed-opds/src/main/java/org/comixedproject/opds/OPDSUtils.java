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

package org.comixedproject.opds;

import java.io.ByteArrayInputStream;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import lombok.NonNull;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.lang.StringUtils;
import org.comixedproject.adaptors.AdaptorException;
import org.comixedproject.adaptors.comicbooks.ComicBookAdaptor;
import org.comixedproject.adaptors.comicbooks.ComicBookMetadataAdaptor;
import org.comixedproject.adaptors.file.FileTypeAdaptor;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.opds.model.OPDSAcquisitionFeedContent;
import org.comixedproject.opds.model.OPDSAcquisitionFeedEntry;
import org.comixedproject.opds.model.OPDSAuthor;
import org.comixedproject.opds.model.OPDSLink;
import org.jsoup.Jsoup;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * <code>OPDSUtils</code> provides utility functions for the OPDS system.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class OPDSUtils {
  static final String COMIC_LINK_URL = "/opds/comics/%d/content/%s";
  static final String COMIC_COVER_URL = "/opds/comics/%d/pages/%d/%d";
  public static final String OPDS_ACQUISITION_RELATION = "http://opds-spec.org/acquisition";
  public static final String OPDS_IMAGE_RELATION = "http://opds-spec.org/image";
  public static final String OPDS_IMAGE_THUMBNAIL = "http://opds-spec.org/image/thumbnail";
  public static final String MIME_TYPE_IMAGE_UNKNOWN = "image/unknown";

  @Autowired private FileTypeAdaptor fileTypeAdaptor;
  @Autowired private ComicBookAdaptor comicBookAdaptor;
  @Autowired private ComicBookMetadataAdaptor comicBookMetadataAdaptor;

  /**
   * Creates a link for the given comicBook.
   *
   * @param comicBook the comicBook
   * @return the link
   */
  public OPDSLink createComicLink(final ComicBook comicBook) {
    return new OPDSLink(
        comicBook.getArchiveType().getMimeType(),
        OPDS_ACQUISITION_RELATION,
        String.format(
            COMIC_LINK_URL, comicBook.getId(), this.urlEncodeString(comicBook.getBaseFilename())));
  }

  public OPDSLink createComicCoverLink(final ComicBook comicBook) {
    return new OPDSLink(
        this.getMimeTypeForCover(comicBook),
        OPDS_IMAGE_RELATION,
        String.format(COMIC_COVER_URL, comicBook.getId(), 0, 160));
  }

  private String getMimeTypeForCover(final ComicBook comicBook) {
    try {
      final byte[] cover = this.comicBookAdaptor.loadCover(comicBook.getFilename());
      return this.fileTypeAdaptor.getMimeTypeFor(new ByteArrayInputStream(cover));
    } catch (AdaptorException error) {
      log.error("Failed to determine comic cover mime type", error);
      return MIME_TYPE_IMAGE_UNKNOWN;
    }
  }

  public OPDSLink createComicThumbnailLink(final ComicBook comicBook) {
    return new OPDSLink(
        this.getMimeTypeForCover(comicBook),
        OPDS_IMAGE_THUMBNAIL,
        String.format(COMIC_COVER_URL, comicBook.getId(), 0, 160));
  }

  /**
   * Encodes a value.
   *
   * @param value the value
   * @return the encoded value
   */
  public String urlEncodeString(final String value) {
    try {
      return URLEncoder.encode(value, StandardCharsets.UTF_8.toString());
    } catch (UnsupportedEncodingException error) {
      log.error("Failed to encode string", error);
      return value;
    }
  }

  /**
   * Decodes a value.
   *
   * @param value the value
   * @return the decoded value
   */
  public String urlDecodeString(final String value) {
    try {
      return URLDecoder.decode(value, StandardCharsets.UTF_8.toString());
    } catch (UnsupportedEncodingException error) {
      log.error("Failed to decode string", error);
      return value;
    }
  }

  /**
   * Creates a well-formed entry for a comicBook book.
   *
   * @param comicBook the comicBook
   * @return the entry
   */
  public OPDSAcquisitionFeedEntry createComicEntry(final ComicBook comicBook) {
    final OPDSAcquisitionFeedEntry result =
        new OPDSAcquisitionFeedEntry(
            this.comicBookMetadataAdaptor.getDisplayableTitle(comicBook),
            String.valueOf(comicBook.getId()));
    comicBook
        .getCredits()
        .forEach(
            credit -> {
              if (StringUtils.contains(credit.getRole(), "writer")) {
                log.trace("Adding writer: {}", credit.getName());
                result
                    .getAuthors()
                    .add(new OPDSAuthor(credit.getName(), String.valueOf(credit.getId())));
              }
            });
    if (StringUtils.isNotEmpty(comicBook.getDescription())) {
      log.trace("Adding summary");
      result.setSummary(Jsoup.parse(comicBook.getDescription()).wholeText());
    }
    log.trace("Setting comicBook link");
    result.getLinks().add(this.createComicCoverLink(comicBook));
    result.getLinks().add(this.createComicThumbnailLink(comicBook));
    result.getLinks().add(this.createComicLink(comicBook));
    result.setContent(new OPDSAcquisitionFeedContent(comicBook.getBaseFilename()));
    return result;
  }

  /**
   * Generates a unique identifier for the given type and name.
   *
   * @param type the type
   * @param name the name
   * @return the identifier
   */
  public Long createIdForEntry(@NonNull final String type, @NonNull final String name) {
    return Long.valueOf((type + name).hashCode());
  }
}
