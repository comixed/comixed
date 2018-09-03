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

package org.comixed.web.model;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * <code>ComicVolume</code> represents a comic volume.
 *
 * @author Darryl L. Pierce
 *
 */
public class ComicVolume
{
    @JsonProperty(value = "id")
    private long id;

    @JsonProperty(value = "name")
    private String name;

    @JsonProperty(value = "issue_count")
    private int issueCount;

    @JsonProperty(value = "image_url")
    private String imageURL;

    @JsonProperty(value = "start_year")
    private int startYear;

    @JsonProperty(value = "publisher")
    private String publisher;

    public long getId()
    {
        return this.id;
    }

    public String getImageURL()
    {
        return this.imageURL;
    }

    public int getIssueCount()
    {
        return this.issueCount;
    }

    public String getName()
    {
        return this.name;
    }

    public String getPublisher()
    {
        return this.publisher;
    }

    public int getStartYear()
    {
        return this.startYear;
    }

    public void setId(long id)
    {
        this.id = id;
    }

    public void setImageURL(String imageURL)
    {
        this.imageURL = imageURL;
    }

    public void setIssueCount(int issueCount)
    {
        this.issueCount = issueCount;
    }

    public void setName(String name)
    {
        this.name = name;
    }

    public void setPublisher(String publisher)
    {
        this.publisher = publisher;
    }

    public void setStartYear(int startYear)
    {
        this.startYear = startYear;
    }
}
