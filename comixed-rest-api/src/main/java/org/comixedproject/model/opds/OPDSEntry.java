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

package org.comixedproject.model.opds;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlElementWrapper;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;
import lombok.extern.log4j.Log4j2;
import org.codehaus.plexus.util.StringUtils;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.comic.Credit;
import org.comixedproject.model.library.ReadingList;

/**
 * <code>OPDSEntry</code> represents a single entry within an OPDS feed.
 *
 * @author João França
 * @author Giao Phan
 * @author Darryl L. Pierce
 */
@Log4j2
public class OPDSEntry {
  @JacksonXmlElementWrapper(useWrapping = false)
  @JacksonXmlProperty(localName = "author")
  private List<OPDSAuthor> authors;

  @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'")
  private Date updated;

  private OPDSContent content;

  @JacksonXmlElementWrapper(useWrapping = false)
  @JacksonXmlProperty(localName = "link")
  private List<OPDSLink> links;

  private String title;
  private String id;

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
        log.debug("Adding author: {}", credit.getName());
        this.authors.add(new OPDSAuthor(credit.getName(), ""));
      }
    }

    // FIXME: Is there some sort of router interface we can
    // use to build urls
    String urlPrefix = "/opds/feed/comics/" + comic.getId();

    if (!comic.isMissing()) {
      log.debug("Added comic to feed: {}", comic.getFilename());

      String coverUrl = urlPrefix + "/0/0";
      String thumbnailUrl = urlPrefix + "/0/160";
      String comicUrl = "";

      try {
        comicUrl =
            urlPrefix
                + "/download/"
                + URLEncoder.encode(comic.getBaseFilename(), StandardCharsets.UTF_8.toString());
      } catch (UnsupportedEncodingException error) {
        log.error("error encoding comic filename", error);
        comicUrl = urlPrefix + "/download/" + comic.getBaseFilename();
      }

      log.debug("coverUrl: {}", coverUrl);
      log.debug("thumbnailUrl: {}", thumbnailUrl);
      log.debug("comicUrl: {}", comicUrl);

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
                  "/opds/feed/comics/" + comic.getId() + "/{pageNumber}/{maxWidth}",
                  comic.getPageCount()));
    } else {
      log.debug("Comic file missing: {}", comic.getFilename());
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
