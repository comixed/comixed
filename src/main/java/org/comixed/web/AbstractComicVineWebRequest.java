/*
 * ComixEd - A digital comic book library management application.
 * Copyright (C) 2017, Darryl L. Pierce
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

import java.text.MessageFormat;
import java.util.HashMap;
import java.util.Map;

import org.comixed.AppConfiguration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * <code>AbstractComicVineWebRequest</code> defines a foundation for creating
 * concrete implementations of {@link WebRequest} that interact with the
 * ComicVine APIs.
 *
 * @author Darryl L. Pierce
 *
 */
public abstract class AbstractComicVineWebRequest extends AbstractWebRequest implements
                                                  ComicVineWebRequest
{
    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    private static final String COMICVINE_URL_PATTERN = "http://comicvine.gamespot.com/api/{0}/?api_key={1}&format=json{2}";
    private static final String FILTER_ARGUMENT = "&filter={0}";
    private static final String FILTER_FORMAT = "{0}:{1}";

    @Autowired
    private AppConfiguration configuration;

    String endpoint;

    Map<String,
        String> filterset = new HashMap<>();

    public AbstractComicVineWebRequest(String endpoint)
    {
        this.endpoint = endpoint;
    }

    /**
     * Adds a filter field to the request.
     *
     * @param name
     *            the filter name
     * @param value
     *            the filter value
     */
    public void addFilter(String name, String value)
    {
        this.logger.debug("Adding request filter: " + name + "=" + value);
        this.filterset.put(name, value);
    }

    @Override
    public String getURL() throws WebRequestException
    {
        if (this.endpoint == null) { throw new WebRequestException("Missing or undefined endpoint"); }
        this.logger.debug("Generating ComicVine URL");
        String filtering = "";
        if (!this.filterset.isEmpty())
        {
            this.logger.debug("Applying filters");
            StringBuffer filters = new StringBuffer();
            for (String key : this.filterset.keySet())
            {
                String value = this.filterset.get(key);
                this.logger.debug("Adding filter: " + key + "=" + value);
                String f = MessageFormat.format(FILTER_FORMAT, key, value);
                if (filters.length() > 0)
                {
                    filters.append(",");
                }
                filters.append(f);
            }
            filtering = MessageFormat.format(FILTER_ARGUMENT, filters.toString());
        }
        String apikey = this.configuration.getOption(COMICVINE_API_KEY);
        String result = MessageFormat.format(COMICVINE_URL_PATTERN, this.endpoint, apikey, filtering);
        return result;
    }
}
