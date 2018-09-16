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

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import org.codehaus.plexus.util.StringUtils;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

/**
 *
 * Example URL:
 * https://comicvine.gamespot.com/api/search/?api_key=YOUR-KEY&format=json&sort=name:asc&resources=issue&query=%22Master%20of%20kung%20fu%22
 *
 * @author mcpierce
 *
 */
@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class ComicVineQueryWebRequest extends AbstractComicVineWebRequest
{
    static final String SERIES_NAME_KEY = "query";

    public ComicVineQueryWebRequest()
    {
        super("search");

        this.addParameter("field_list", "name,start_year,publisher,id,image,count_of_issues");
        this.addParameter("resources", "volume");
    }

    @Override
    public String getURL() throws WebRequestException
    {
        this.checkForMissingRequiredParameter(SERIES_NAME_KEY);

        return super.getURL();
    }

    public void setPage(int page)
    {
        this.addParameter("page", String.valueOf(page));
    }

    /**
     * Sets the name for the series to be queried.
     *
     * @param name
     *            the series name
     * @throws WebRequestException
     *             if an error occurs
     */
    public void setSeriesName(String name) throws WebRequestException
    {
        if (!StringUtils.isEmpty(name))
        {
            if (this.parameterSet.containsKey(SERIES_NAME_KEY)) throw new WebRequestException("Series name already set");

            try
            {
                this.addParameter("query", URLEncoder.encode(name, StandardCharsets.UTF_8.name()));
            }
            catch (UnsupportedEncodingException error)
            {
                throw new WebRequestException("Unable to encode series name", error);
            }
        }
    }
}
