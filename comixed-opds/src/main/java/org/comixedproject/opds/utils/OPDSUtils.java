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

package org.comixedproject.opds.utils;

import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.lang.StringUtils;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.opds.model.OPDSAcquisitionFeedContent;
import org.comixedproject.opds.model.OPDSAcquisitionFeedEntry;
import org.comixedproject.opds.model.OPDSAuthor;
import org.comixedproject.opds.model.OPDSLink;

/**
 * <code>OPDSUtils</code> provides utility functions for the OPDS system.
 *
 * @author Darryl L. Pierce
 */
@Log4j2
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class OPDSUtils {
  public static final String URN_UUID_FORMAT_STRING = "urn:uuid:%s";
  static final String COMIC_LINK_URL = "/opds/comics/%d/content/%s";
  static final String COMIC_COVER_URL = "/opds/comics/%d/pages/%d/%d";
  public static final String OPDS_ACQUISITION_RELATION = "http://opds-spec.org/acquisition";
  public static final String OPDS_IMAGE_RELATION = "http://opds-spec.org/image";
  public static final String OPDS_IMAGE_THUMBNAIL = "http://opds-spec.org/image/thumbnail";
  public static final String IMAGE_MIME_TYPE = "image/jpeg";

  /**
   * Creates a link for the given comic.
   *
   * @param comic the comic
   * @return the link
   */
  public static OPDSLink createComicLink(final Comic comic) {
    return new OPDSLink(
        comic.getArchiveType().getMimeType(),
        OPDS_ACQUISITION_RELATION,
        String.format(
            COMIC_LINK_URL, comic.getId(), OPDSUtils.urlEncodeString(comic.getBaseFilename())));
  }

  public static OPDSLink createComicCoverLink(final Comic comic) {
    return new OPDSLink(
        IMAGE_MIME_TYPE,
        OPDS_IMAGE_RELATION,
        String.format(COMIC_COVER_URL, comic.getId(), 0, 160));
  }

  public static OPDSLink createComicThumbnailLink(final Comic comic) {
    return new OPDSLink(
        IMAGE_MIME_TYPE,
        OPDS_IMAGE_THUMBNAIL,
        String.format(COMIC_COVER_URL, comic.getId(), 0, 160));
  }

  /**
   * Encodes a value.
   *
   * @param value the value
   * @return the encoded value
   */
  public static String urlEncodeString(final String value) {
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
  public static String urlDecodeString(final String value) {
    try {
      return URLDecoder.decode(value, StandardCharsets.UTF_8.toString());
    } catch (UnsupportedEncodingException error) {
      log.error("Failed to decode string", error);
      return value;
    }
  }

  /**
   * Creates a well-formed entry for a comic book.
   *
   * @param comic the comic
   * @return the entry
   */
  public static OPDSAcquisitionFeedEntry createComicEntry(final Comic comic) {
    final OPDSAcquisitionFeedEntry result =
        new OPDSAcquisitionFeedEntry(comic.getBaseFilename(), String.valueOf(comic.getId()));
    comic
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
    if (StringUtils.isNotEmpty(comic.getDescription())) {
      log.trace("Adding summary");
      result.setSummary(comic.getDescription());
    }
    log.trace("Setting comic link");
    result.getLinks().add(OPDSUtils.createComicCoverLink(comic));
    result.getLinks().add(OPDSUtils.createComicThumbnailLink(comic));
    result.getLinks().add(OPDSUtils.createComicLink(comic));
    result.setContent(new OPDSAcquisitionFeedContent(comic.getBaseFilename()));
    return result;
  }
}
