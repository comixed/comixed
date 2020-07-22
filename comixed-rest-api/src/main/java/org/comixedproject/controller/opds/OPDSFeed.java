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

package org.comixedproject.controller.opds;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement;
import java.util.Date;
import java.util.List;
import org.comixedproject.model.opds.OPDSEntry;
import org.comixedproject.model.opds.OPDSLink;

/**
 * <code>OPDSFeed</code> defines a type which represents a single OPDS feed.
 *
 * @author João França
 * @author Giao Phan
 * @author Darryl L. Pierce
 */
@JacksonXmlRootElement(localName = "feed", namespace = "http://www.w3.org/2005/Atom")
public interface OPDSFeed {
  public String getId();

  public String getTitle();

  public Date getUpdated();

  public String getIcon();

  public List<OPDSLink> getLinks();

  public List<OPDSEntry> getEntries();
}
