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

package org.comixed.controller.opds;

import java.time.ZonedDateTime;
import java.util.*;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlElementWrapper;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import org.comixed.model.library.ReadingList;
import org.comixed.model.library.ReadingListEntry;
import org.comixed.model.opds.OPDSAuthor;
import org.comixed.model.opds.OPDSEntry;
import org.comixed.model.opds.OPDSLink;

/**
 * <code>OPDSNavigationFeed</code> provides an implementation of
 * {@link OPDSFeed}.
 *
 * @author João França
 * @author Giao Phan
 * @author Darryl L. Pierce
 */
public class OPDSNavigationFeed implements
                                OPDSFeed
{
    private String id;

    private String title;

    private ZonedDateTime updated;

    private String icon;

    @JacksonXmlElementWrapper(useWrapping = false)
    @JacksonXmlProperty(localName = "link")
    private List<OPDSLink> links;

    @JacksonXmlElementWrapper(useWrapping = false)
    @JacksonXmlProperty(localName = "entry")
    private List<OPDSEntry> entries;

    public OPDSNavigationFeed()
    {

        this.id = "urn:uuid:" + UUID.randomUUID();
        this.title = "ComiXed catalog";
        this.icon= "/favicon.ico";
        this.updated = ZonedDateTime.now()
                .withFixedOffsetZone();

        this.links = Arrays.asList(new OPDSLink("application/atom+xml; profile=opds-catalog; kind=navigation", "self",
                        "/opds-comics"),
                new OPDSLink("application/atom+xml; profile=opds-catalog; kind=navigation", "start",
                        "/opds-comics"));

        List<OPDSAuthor> noAuthor = Arrays.asList(new OPDSAuthor("None", ""));
        this.entries = Arrays.asList(new OPDSEntry("All comics", "All comics as a flat list", noAuthor,
                Arrays.asList(new OPDSLink("application/atom+xml;profile=opds-catalog;kind=acquisition",
                        "subsection",
                        "/opds-comics/all"))),
                new OPDSEntry("Folders", "All comics grouped by lists.", noAuthor,
                        Arrays.asList(new OPDSLink("application/atom+xml;profile=opds-catalog;kind=acquisition",
                                "subsection",
                                "/opds-comics/all?groupByFolder=true"))));

    }

    public OPDSNavigationFeed(String selfUrl, String title, List<ReadingList> readingLists)
    {
        this.id = "urn:uuid:" + UUID.randomUUID();
        this.entries = new ArrayList<>();
        this.icon= "/favicon.ico";
        for (ReadingList readingList : readingLists)
        {
            this.entries.add(new OPDSEntry(readingList, readingList.getId()));
        }
        this.title = title + readingLists.size() + " items";
        this.updated = ZonedDateTime.now()
                .withFixedOffsetZone();
        this.links = Arrays.asList(new OPDSLink("application/atom+xml; profile=opds-catalog; kind=navigation", "self",
                        selfUrl),
                new OPDSLink("application/atom+xml; profile=opds-catalog; kind=navigation", "start",
                        "/opds-comics"));
    }

    public OPDSNavigationFeed(String selfUrl, String title, ReadingList readingList)
    {
        this.id = "urn:uuid:" + UUID.randomUUID();
        this.entries = new ArrayList<>();
        this.icon= "/favicon.ico";
        int count = 0;
        Set<ReadingListEntry> comics = readingList.getEntries();

        for (ReadingListEntry comic : comics)
        {
            if (!comic.getComic().isMissing()) {
                this.entries.add(new OPDSEntry(comic.getComic()));
                count++;
            }
        }
        this.title = title + count + " items";
        this.updated = ZonedDateTime.now()
                .withFixedOffsetZone();
        this.links = Arrays.asList(new OPDSLink("application/atom+xml; profile=opds-catalog; kind=navigation", "self",
                        selfUrl),
                new OPDSLink("application/atom+xml; profile=opds-catalog; kind=navigation", "start",
                        "/opds-comics"));
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
    public String getIcon()
    {
        return this.icon;
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
