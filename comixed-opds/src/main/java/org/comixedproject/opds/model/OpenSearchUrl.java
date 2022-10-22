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
import lombok.Getter;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;

/**
 * <code>OpenSearchUrl</code> represents a single URL in a {@link OpenSearchDescriptor}.
 *
 * @author Darryl L. Pierce
 */
@RequiredArgsConstructor
public class OpenSearchUrl {
  @JacksonXmlProperty(localName = "type", isAttribute = true)
  @Getter
  @NonNull
  private String type;

  @JacksonXmlProperty(localName = "method", isAttribute = true)
  @Getter
  @NonNull
  private String method = "get";

  @JacksonXmlProperty(localName = "template", isAttribute = true)
  @Getter
  @NonNull
  private String template;
}
