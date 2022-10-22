/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement;
import lombok.Getter;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;

/**
 * <code>OpenSearchDescriptor</code> represents the payload returned when the search capabilities
 * are queried.
 *
 * @author Darryl L. Pierce
 */
@JacksonXmlRootElement(
    localName = "OpenSearchDescription",
    namespace = "http://a9.com/-/spec/opensearch/1.1/")
@RequiredArgsConstructor
public class OpenSearchDescriptor {
  @JacksonXmlProperty(localName = "ShortName")
  @Getter
  @NonNull
  private String shortName = "CXSRCH";

  @JacksonXmlProperty(localName = "Description")
  @Getter
  @NonNull
  private String description = "Search the ComiXed library";

  @JacksonXmlProperty(localName = "InputEncoding")
  @Getter
  @NonNull
  private String inputEncoding = "UTF-8";

  @JacksonXmlProperty(localName = "Url")
  @Getter
  @NonNull
  private OpenSearchUrl url =
      new OpenSearchUrl(
          "application/atom+xml;profile=opds-catalog;kind=acquisition",
          "/opds/search?terms={searchTerms}");
}
