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

package org.comixed.web.comicvine;

import java.util.HashMap;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ComicVineVolume
{
    static final String IMAGE_URL_TO_USE_KEY = "original_url";
    static final String PUBLISHER_NAME_KEY = "name";

    @JsonProperty(value = "id")
    int id;

    @JsonProperty(value = "count_of_issues")
    int issueCount;

    @JsonProperty(value = "name")
    String name;

    @JsonProperty(value = "image")
    Map<String,
        String> imageURLs = new HashMap<>();

    @JsonProperty(value = "start_year")
    String startYear;

    @JsonProperty(value = "publisher")
    Map<String,
        String> publisher = new HashMap<>();

    public ComicVineVolume()
    {}

    public int getId()
    {
        return this.id;
    }

    public String getImageURL()
    {
        return this.imageURLs.get(IMAGE_URL_TO_USE_KEY);
    }

    public int getIssueCount()
    {
        return this.issueCount;
    }

    public String getName()
    {
        return this.name;
    }

    public String getStartYear()
    {
        return this.startYear;
    }

    public String getPublisher()
    {
        return this.publisher.get(PUBLISHER_NAME_KEY);
    }
}