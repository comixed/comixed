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

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlCData;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import java.util.Objects;
import lombok.Getter;
import lombok.NonNull;
import lombok.Setter;

/**
 * <code>OPDSAcquisitionFeedEntry</code> is a single entry in a {@link OPDSAcquisitionFeed}.
 *
 * @author Darryl L. Pierce
 */
public class OPDSAcquisitionFeedEntry extends OPDSFeedEntry<OPDSAcquisitionFeedContent> {
  @JacksonXmlProperty(localName = "summary")
  @JacksonXmlCData
  @Getter
  @Setter
  private String summary;

  public OPDSAcquisitionFeedEntry(@NonNull final String title, @NonNull final String id) {
    super(title, id);
  }

  @Override
  public boolean equals(final Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    if (!super.equals(o)) return false;
    final OPDSAcquisitionFeedEntry that = (OPDSAcquisitionFeedEntry) o;
    return Objects.equals(summary, that.summary);
  }

  @Override
  public int hashCode() {
    return Objects.hash(super.hashCode(), summary);
  }
}
