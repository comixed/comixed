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

package org.comixedproject.opds;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlElementWrapper;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import java.util.*;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.library.ReadingList;
import org.comixedproject.model.opds.OPDSAuthor;
import org.comixedproject.model.opds.OPDSEntry;
import org.comixedproject.model.opds.OPDSLink;

/**
 * <code>OPDSNavigationFeed</code> provides an implementation of {@link OPDSFeed}.
 *
 * @author João França
 * @author Giao Phan
 * @author Darryl L. Pierce
 */
public class OPDSNavigationFeed implements OPDSFeed {
  public static final String URN_UUID = "urn:uuid:";
  public static final String FAVICON = "/favicon.ico";
  public static final String OPDS_LINK_TYPE =
      "application/atom+xml; profile=opds-catalog; kind=navigation";
  public static final String OPDS_ROOT_LINK = "/opds-comics";
  public static final String START = "start";
  public static final String SELF = "self";
  private String id;

  private String title;

  @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'")
  private Date updated;

  private String icon;

  @JacksonXmlElementWrapper(useWrapping = false)
  @JacksonXmlProperty(localName = "link")
  private List<OPDSLink> links;

  @JacksonXmlElementWrapper(useWrapping = false)
  @JacksonXmlProperty(localName = "entry")
  private List<OPDSEntry> entries;

  public OPDSNavigationFeed() {

    this.id = URN_UUID + UUID.randomUUID();
    this.title = "ComiXed catalog";
    this.icon = FAVICON;
    this.updated = new Date(System.currentTimeMillis());

    this.links =
        Arrays.asList(
            new OPDSLink(OPDS_LINK_TYPE, SELF, OPDS_ROOT_LINK),
            new OPDSLink(OPDS_LINK_TYPE, START, OPDS_ROOT_LINK));

    List<OPDSAuthor> noAuthor = Arrays.asList(new OPDSAuthor("None", ""));
    this.entries =
        Arrays.asList(
            new OPDSEntry(
                "All comics",
                "All comics as a flat list",
                noAuthor,
                Arrays.asList(
                    new OPDSLink(
                        "application/atom+xml;profile=opds-catalog;kind=acquisition",
                        "subsection",
                        "/opds-comics/all"))),
            new OPDSEntry(
                "Folders",
                "All comics grouped by lists.",
                noAuthor,
                Arrays.asList(
                    new OPDSLink(
                        "application/atom+xml;profile=opds-catalog;kind=acquisition",
                        "subsection",
                        "/opds-comics/all?groupByFolder=true"))));
  }

  public OPDSNavigationFeed(String selfUrl, String title, List<ReadingList> readingLists) {
    this.id = URN_UUID + UUID.randomUUID();
    this.entries = new ArrayList<>();
    this.icon = FAVICON;
    for (ReadingList readingList : readingLists) {
      this.entries.add(new OPDSEntry(readingList, readingList.getId()));
    }
    this.title = title + readingLists.size() + " items";
    this.updated = new Date(System.currentTimeMillis());
    this.links =
        Arrays.asList(
            new OPDSLink(OPDS_LINK_TYPE, "self", selfUrl),
            new OPDSLink(OPDS_LINK_TYPE, START, OPDS_ROOT_LINK));
  }

  public OPDSNavigationFeed(String selfUrl, String title, ReadingList readingList) {
    this.id = URN_UUID + UUID.randomUUID();
    this.entries = new ArrayList<>();
    this.icon = FAVICON;
    int count = 0;
    List<Comic> comics = readingList.getComics();

    for (Comic comic : comics) {
      if (!comic.isMissing()) {
        this.entries.add(new OPDSEntry(comic));
        count++;
      }
    }
    this.title = title + count + " items";
    this.updated = new Date(System.currentTimeMillis());
    this.links =
        Arrays.asList(
            new OPDSLink(OPDS_LINK_TYPE, "self", selfUrl),
            new OPDSLink(OPDS_LINK_TYPE, START, OPDS_ROOT_LINK));
  }

  @Override
  public List<OPDSEntry> getEntries() {
    return this.entries;
  }

  @Override
  public String getId() {
    return this.id;
  }

  @Override
  public String getIcon() {
    return this.icon;
  }

  @Override
  public List<OPDSLink> getLinks() {
    return this.links;
  }

  @Override
  public String getTitle() {
    return this.title;
  }

  @Override
  public Date getUpdated() {
    return this.updated;
  }
}
