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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

package org.comixedproject.model.opds;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;

/**
 * <code>OPDSVLink</code> extends OPDSLink with extra link with page count
 *
 * @author João França
 * @author Darryl L. Pierce
 * @author Giao Phan
 */
public class OPDSVLink extends OPDSLink {

  @JacksonXmlProperty(isAttribute = true, namespace = "http://vaemendis.net/opds-pse/ns")
  private String count;

  public OPDSVLink(String type, String rel, String href, Integer count) {
    super(type, rel, href);
    this.count = count.toString();
  }

  public String getCount() {
    return this.count;
  }
}
