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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

package org.comixed.web.opds;

import java.time.ZonedDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import org.comixed.model.opds.OPDSEntry;
import org.comixed.model.opds.OPDSLink;

/**
 * <code>OPDSNavigationFeed</code> provides an implementation of
 * {@link OPDSFeed}.
 *
 * @author Giao Phan
 * @author Darryl L. Pierce
 */
public class OPDSNavigationFeed implements
                                OPDSFeed
{
    private String id;
    private String title;
    private ZonedDateTime updated;
    private List<OPDSEntry> entries;
    private List<OPDSLink> links;

    public OPDSNavigationFeed()
    {
        this.id = "urn:uuid:" + UUID.randomUUID();
        this.title = "ComiXed catalog";
        this.updated = ZonedDateTime.now()
                .withFixedOffsetZone();
        this.links = Arrays.asList(new OPDSLink("application/atom+xml; profile=opds-catalog; kind=navigation", "self",
                        "/opds"),
                new OPDSLink("application/atom+xml; profile=opds-catalog; kind=navigation", "start",
                        "/opds"));

        List<String> noAuthor = Arrays.asList("None");
        this.entries = Arrays.asList(new OPDSEntry("All comics", "All comics as a flat list", noAuthor,
                Arrays.asList(new OPDSLink("application/atom+xml;profile=opds-catalog;kind=acquisition",
                        "subsection",
                        "/opds/all?mediaType=atom"))));

    }

    @Override
    public List<OPDSEntry> getEntries()
    {
        return this.entries;
    }

    @Override
    public String getId()
    {
        return this.id;
    }

    @Override
    public List<OPDSLink> getLinks()
    {
        return this.links;
    }

    @Override
    public String getTitle()
    {
        return this.title;
    }

    @Override
    public ZonedDateTime getUpdated()
    {
        return this.updated;
    }
}
