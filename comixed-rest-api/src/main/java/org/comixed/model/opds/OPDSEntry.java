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

package org.comixed.model.opds;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import org.codehaus.plexus.util.StringUtils;
import org.comixed.library.model.Comic;
import org.comixed.library.model.Credit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * <code>OPDSEntry</code> represents a single entry within an OPDS feed.
 *
 * @author Giao Phan
 * @author Darryl L. Pierce
 */
public class OPDSEntry
{
    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    public String id;
    public String title;
    public ZonedDateTime updated;
    public List<OPDSLink> links;
    public String content;
    public List<String> authors;

    public OPDSEntry(Comic comic)
    {
        this.id = comic.getId()
                .toString();
        this.updated = this.convertDateToZondedDateTime(comic.getDateAdded());

        this.title = StringUtils.isNotEmpty(comic.getTitle()) ? comic.getTitle() : comic.getBaseFilename();
        this.content = StringUtils.isNotEmpty(comic.getSummary()) ? comic.getSummary() : "";

        this.authors = new ArrayList<>();
        for (Credit credit : comic.getCredits())
        {
            if (StringUtils.equals(credit.getRole()
                    .toUpperCase(), "WRITER"))
            {
                this.logger.debug("Adding author: {}", credit.getName());
                this.authors.add(credit.getName());
            }
        }

        // FIXME: Is there some sort of router interface we can
        // use to build urls
        String urlPrefix = "/api/comics/" + comic.getId();

        if (!comic.isMissing())
        {
            this.logger.debug("Added comic to feed: {}", comic.getFilename());
            this.links = Arrays.asList(new OPDSLink("image/jpeg", "http://opds-spec.org/image",
                            urlPrefix + "/pages/0/content"),
                    new OPDSLink("image/jpeg", "http://opds-spec.org/image/thumbnail",
                            urlPrefix + "/pages/0/content"),
                    new OPDSLink(comic.getArchiveType()
                            .getMimeType(),
                            "http://opds-spec.org/acquisition",
                            urlPrefix + "/download/?filename=" + comic.getFilename()));
        } else
        {
            this.logger.debug("Comic file missing: {}", comic.getFilename());
        }
    }

    public OPDSEntry(String title, String content, List<String> authors, List<OPDSLink> links)
    {
        this.id = "urn:uuid:" + UUID.randomUUID();
        this.updated = ZonedDateTime.now()
                .withFixedOffsetZone();

        this.title = title;
        this.content = content;
        this.authors = authors;
        this.links = links;
    }

    private ZonedDateTime convertDateToZondedDateTime(Date date)
    {
        return Instant.ofEpochMilli(date.getTime())
                .atZone(ZoneId.systemDefault())
                .toLocalDate()
                .atStartOfDay(ZoneId.systemDefault())
                .withFixedOffsetZone();
    }

    public List<String> getAuthors()
    {
        return this.authors;
    }

    public String getContent()
    {
        return this.content;
    }

    public String getId()
    {
        return this.id;
    }

    public List<OPDSLink> getLinks()
    {
        return this.links;
    }

    public String getTitle()
    {
        return this.title;
    }

    public ZonedDateTime getUpdated()
    {
        return this.updated;
    }
}
