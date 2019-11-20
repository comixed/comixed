/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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

package org.comixed.model.opds;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlElementWrapper;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;
import org.codehaus.plexus.util.StringUtils;
import org.comixed.model.library.Comic;
import org.comixed.model.library.Credit;
import org.comixed.model.library.ReadingList;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * <code>OPDSEntry</code> represents a single entry within an OPDS feed.
 *
 * @author João França
 * @author Giao Phan
 * @author Darryl L. Pierce
 */
public class OPDSEntry {
  protected final Logger logger = LoggerFactory.getLogger(this.getClass());

  public String title;

  public String id;

  @JacksonXmlElementWrapper(useWrapping = false)
  @JacksonXmlProperty(localName = "author")
  public List<OPDSAuthor> authors;

  @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'")
  public Date updated;

  public OPDSContent content;

  @JacksonXmlElementWrapper(useWrapping = false)
  @JacksonXmlProperty(localName = "link")
  public List<OPDSLink> links;

  public OPDSEntry(Comic comic) {
    this.id = comic.getId().toString();
    this.updated = comic.getDateAdded();

    this.title = comic.getBaseFilename();
    StringBuilder comicContent = new StringBuilder("");
    if (StringUtils.isNotEmpty(comic.getTitle())) {
      comicContent.append(comic.getTitle());
      comicContent.append(" - ");
    }
    if (StringUtils.isNotEmpty(comic.getSummary())) {
      comicContent.append(comic.getSummary());
    }
    this.content = new OPDSContent(comicContent.toString());

    this.authors = new ArrayList<>();
    for (Credit credit : comic.getCredits()) {
      if (StringUtils.equals(credit.getRole().toUpperCase(), "WRITER")) {
        this.logger.debug("Adding author: {}", credit.getName());
        this.authors.add(new OPDSAuthor(credit.getName(), ""));
      }
    }

    // FIXME: Is there some sort of router interface we can
    // use to build urls
    String urlPrefix = "/opds-comics/feed/comics/" + comic.getId();

    if (!comic.isMissing()) {
      this.logger.debug("Added comic to feed: {}", comic.getFilename());

      String coverUrl = urlPrefix + "/0/0";
      String thumbnailUrl = urlPrefix + "/0/160";
      String comicUrl = "";

      try {
        comicUrl =
            urlPrefix
                + "/download/"
                + URLEncoder.encode(comic.getBaseFilename(), StandardCharsets.UTF_8.toString());
      } catch (UnsupportedEncodingException error) {
        this.logger.error("error encoding comic filename", error);
        comicUrl = urlPrefix + "/download/" + comic.getBaseFilename();
      }

      this.logger.debug("coverUrl: {}", coverUrl);
      this.logger.debug("thumbnailUrl: {}", thumbnailUrl);
      this.logger.debug("comicUrl: {}", comicUrl);

      // TODO need to get the correct mime types for the cover
      this.links =
          Arrays.asList(
              new OPDSLink("image/jpeg", "http://opds-spec.org/image", coverUrl + "?cover=true"),
              new OPDSLink(
                  "image/jpeg",
                  "http://opds-spec.org/image/thumbnail",
                  thumbnailUrl + "?cover=true"),
              new OPDSLink(
                  comic.getArchiveType().getMimeType(),
                  "http://opds-spec.org/acquisition",
                  comicUrl),
              new OPDSVLink(
                  "image/jpeg",
                  "http://vaemendis.net/opds-pse/stream",
                  "/opds-comics/feed/comics/" + comic.getId() + "/{pageNumber}/{maxWidth}",
                  comic.getPageCount()));
    } else {
      this.logger.debug("Comic file missing: {}", comic.getFilename());
    }
  }

  public OPDSEntry(String title, String content, List<OPDSAuthor> authors, List<OPDSLink> links) {
    this.id = "urn:uuid:" + UUID.randomUUID();
    this.updated = new Date(System.currentTimeMillis());

    this.title = title;
    this.content = new OPDSContent(content);
    this.authors = authors;
    this.links = links;
  }

  public OPDSEntry(ReadingList readingList, Long id) {
    this.id = readingList.getId().toString();
    this.title = readingList.getName();
    this.links =
        Arrays.asList(
            new OPDSLink(
                "application/atom+xml; profile=opds-catalog; kind=acquisition",
                "subsection",
                "/opds-comics/" + id + "/?displayFiles=true"));
  }

  public List<OPDSAuthor> getAuthors() {
    return this.authors;
  }

  public OPDSContent getContent() {
    return this.content;
  }

  public String getId() {
    return this.id;
  }

  public List<OPDSLink> getLinks() {
    return this.links;
  }

  public String getTitle() {
    return this.title;
  }

  public Date getUpdated() {
    return this.updated;
  }
}
