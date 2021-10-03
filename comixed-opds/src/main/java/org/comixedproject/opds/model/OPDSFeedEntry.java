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

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlElementWrapper;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Objects;
import lombok.Getter;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.comixedproject.opds.utils.OPDSUtils;

/**
 * <code>OPDSFeedEntry</code> defines a type that is an entry in an OPDS feed.
 *
 * @param <C> The underlying content type
 * @author Darryl L. Pierce
 */
@RequiredArgsConstructor
public abstract class OPDSFeedEntry<C extends OPDSFeedContent> {
  @JacksonXmlProperty(localName = "title")
  @Getter
  @NonNull
  private String title;

  @Override
  public boolean equals(final Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    final OPDSFeedEntry<?> that = (OPDSFeedEntry<?>) o;
    return title.equals(that.title);
  }

  @Override
  public int hashCode() {
    return Objects.hash(title);
  }

  @JacksonXmlElementWrapper(useWrapping = false)
  @JacksonXmlProperty(localName = "author")
  @Getter
  private List<OPDSAuthor> authors = new ArrayList<>();

  @JacksonXmlProperty(localName = "updated")
  @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'")
  @Getter
  @Setter
  private Date updated = new Date();

  @JacksonXmlProperty(localName = "content")
  @Getter
  @Setter
  private C content;

  @JacksonXmlElementWrapper(useWrapping = false)
  @JacksonXmlProperty(localName = "link")
  @Getter
  private List<OPDSLink> links = new ArrayList<>();

  private String id;

  @JacksonXmlProperty(localName = "id")
  public String getId() {
    if (this.id == null) {
      this.id = OPDSUtils.generateID();
    }
    return this.id;
  }
}
