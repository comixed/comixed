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

import org.apache.http.client.HttpClient;
import org.apache.http.impl.client.HttpClients;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * <code>WebRequestClient</code> encapsulates the underlying HTTP client
 * implementation.
 * 
 * @author Darryl L. Pierce
 *
 */
@Component
public class WebRequestClient
{
    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    /**
     * Creates an HTTP client object for use in a web request.
     * 
     * @return a client
     */
    public HttpClient createClient()
    {
        logger.debug("Creating a HTTP client");
        return HttpClients.createDefault();
    }
}
