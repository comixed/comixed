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

package org.comixedproject.opds.model;

import static org.comixedproject.opds.model.OPDSNavigationFeed.NAVIGATION_FEED_LINK_TYPE;
import static org.comixedproject.opds.model.OPDSNavigationFeed.SEARCH_LINK_TYPE;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlElementWrapper;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import lombok.Getter;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;

/**
 * <code>OPDSFeed</code> contains the content for a feed request.
 *
 * @param <E> The entry type for the feed.
 * @author Darryl L. Pierce
 */
@JacksonXmlRootElement(localName = "feed", namespace = "http://www.w3.org/2005/Atom")
@RequiredArgsConstructor
public abstract class OPDSFeed<E extends OPDSFeedEntry> {
  @JacksonXmlProperty(localName = "title")
  @Getter
  @NonNull
  private String title;

  @JacksonXmlProperty(localName = "id")
  @Getter
  @NonNull
  private String id;

  @JacksonXmlProperty(localName = "icon")
  @Getter
  @NonNull
  private String icon = "/favicon.ico";

  @JacksonXmlProperty(localName = "author")
  @Getter
  private OPDSAuthor author = new OPDSAuthor("ComiXed", "0");

  @JacksonXmlProperty(localName = "updated")
  @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'")
  @Getter
  private Date updated = new Date();

  @JacksonXmlElementWrapper(useWrapping = false)
  @JacksonXmlProperty(localName = "link")
  @Getter
  private List<OPDSLink> links =
      new ArrayList<>() {
        {
          add(new OPDSLink(NAVIGATION_FEED_LINK_TYPE, "start", "/opds/"));
          add(new OPDSLink(SEARCH_LINK_TYPE, "search", "/opds/search.xml"));
        }
      };

  @JacksonXmlElementWrapper(useWrapping = false)
  @JacksonXmlProperty(localName = "entry")
  @Getter
  private List<E> entries = new ArrayList<>();
}
