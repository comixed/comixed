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

package org.comixed.web.opds;

import java.time.ZonedDateTime;
import java.util.List;

import org.comixed.model.opds.OPDSEntry;
import org.comixed.model.opds.OPDSLink;

/**
 * <code>OPDSFeed</code> defines a type which represents a single OPDS feed.
 * 
 * @author Giao Phan
 * @author Darryl L. Pierce
 *
 */
public interface OPDSFeed
{
    public String getId();

    public String getTitle();

    public ZonedDateTime getUpdated();

    public List<OPDSLink> getLinks();

    public List<OPDSEntry> getEntries();
}
