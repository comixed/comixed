/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project.
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
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import org.comixed.model.library.Comic;
import org.comixed.model.opds.OPDSEntry;
import org.comixed.model.opds.OPDSLink;

/**
 * <code>OPDSAcquisitionFeed</code> provides data for acquiring feeds.
 *
 * @author Giao Phan
 * @author Darryl L. Pierce
 */
public class OPDSAcquisitionFeed implements
                                 OPDSFeed
{
    private String id;
    private String title;
    private ZonedDateTime updated;
    private List<OPDSEntry> entries;
    private List<OPDSLink> links;

    public OPDSAcquisitionFeed(String selfUrl, String title, Iterable<Comic> comics)
    {
        this.id = "urn:uuid:" + UUID.randomUUID();
//        this.entries = StreamSupport.stream(comics.spliterator(), true).map(comic -> new OPDSEntry(comic))
//                                    .collect(Collectors.toList());
        this.entries = new ArrayList<>();
        int count = 0;
        for (Comic comic : comics)
        {
            if (!comic.isMissing())
                this.entries.add(new OPDSEntry(comic));
        }
        this.title = title;
        this.updated = ZonedDateTime.now()
                .withFixedOffsetZone();
        this.links = Arrays.asList(new OPDSLink("application/atom+xml; profile=opds-catalog; kind=acquisition", "self",
                        selfUrl),
                new OPDSLink("application/atom+xml; profile=opds-catalog; kind=navigation", "start",
                        "/api/opds?mediaType=atom"));
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
