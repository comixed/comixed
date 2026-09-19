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

import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import lombok.NonNull;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.adaptors.comicbooks.ComicAdaptor;
import org.comixedproject.adaptors.comicbooks.ComicMetadataAdaptor;
import org.comixedproject.adaptors.file.FileTypeAdaptor;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.comicbooks.ComicTagType;
import org.comixedproject.opds.model.OPDSAcquisitionFeedContent;
import org.comixedproject.opds.model.OPDSAcquisitionFeedEntry;
import org.comixedproject.opds.model.OPDSLink;
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
  public static final String MIME_TYPE_IMAGE = "image/*";
  public static final String ENCODED_SLASH = "[SLASH]";

  @Autowired private FileTypeAdaptor fileTypeAdaptor;
  @Autowired private ComicAdaptor comicAdaptor;
  @Autowired private ComicMetadataAdaptor comicMetadataAdaptor;

  /**
   * Creates a link for the given comic.
   *
   * @param comic the comic
   * @return the link
   */
  public OPDSLink createComicLink(final Comic comic) {
    return new OPDSLink(
        comic.getArchiveType().getMimeType(),
        OPDS_ACQUISITION_RELATION,
        String.format(
            COMIC_LINK_URL, comic.getComicId(), this.urlEncodeString(comic.getBaseFilename())));
  }

  public OPDSLink createComicCoverLink(final Comic comic) {
    return new OPDSLink(
        MIME_TYPE_IMAGE,
        OPDS_IMAGE_RELATION,
        String.format(COMIC_COVER_URL, comic.getComicId(), 0, 160));
  }

  public OPDSLink createComicThumbnailLink(final Comic comic) {
    return new OPDSLink(
        MIME_TYPE_IMAGE,
        OPDS_IMAGE_THUMBNAIL,
        String.format(COMIC_COVER_URL, comic.getComicId(), 0, 160));
  }

  /**
   * Encodes a value.
   *
   * @param value the value
   * @return the encoded value
   */
  public String urlEncodeString(final String value) {
    try {
      return URLEncoder.encode(
          value.replace("/", ENCODED_SLASH), StandardCharsets.UTF_8.toString());
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
      return URLDecoder.decode(value, StandardCharsets.UTF_8.toString())
          .replace(ENCODED_SLASH, "/");
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
  public OPDSAcquisitionFeedEntry createComicEntry(final Comic comic) {
    final OPDSAcquisitionFeedEntry result =
        new OPDSAcquisitionFeedEntry(
            this.comicMetadataAdaptor.getDisplayableTitle(comic),
            String.valueOf(comic.getComicId()));
    log.trace("Setting comic link");
    result.getLinks().add(this.createComicCoverLink(comic));
    result.getLinks().add(this.createComicThumbnailLink(comic));
    result.getLinks().add(this.createComicLink(comic));
    result.setContent(new OPDSAcquisitionFeedContent(comic.getBaseFilename()));
    return result;
  }

  /**
   * Generates a unique identifier for the given type and name.
   *
   * @param type the type
   * @param name the name
   * @return the identifier
   */
  public Long createIdForEntry(@NonNull final ComicTagType type, @NonNull final String name) {
    return createIdForEntry(type.getOpdsValue(), name);
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
