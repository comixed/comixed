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

package org.comixed.web;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * 
 * Example URL:
 * https://comicvine.gamespot.com/api/search/?api_key=YOUR-KEY&format=json&sort=name:asc&resources=issue&query=%22Master%20of%20kung%20fu%22
 * 
 * @author mcpierce
 *
 */
public class ComicVineQueryWebRequest extends AbstractComicVineWebRequest
{
    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    public ComicVineQueryWebRequest()
    {
        super("search");
    }

    /**
     * Sets the name for the series to be queried.
     * 
     * @param name
     *            the series name
     */
    public void setSeriesName(String name)
    {
        this.addParameter("query=\"" + name + "\"");
    }
}
