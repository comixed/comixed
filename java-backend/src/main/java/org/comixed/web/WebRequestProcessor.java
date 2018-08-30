/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project
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

import java.io.IOException;

import org.apache.commons.io.IOUtils;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.comixed.ComiXedApp;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * <code>WebRequestProcessor</code> handles executing an instance of
 * {@link WebRequest} to retrieve data from a web service.
 *
 * @author Darryl L. Pierce
 *
 */
@Component
public class WebRequestProcessor
{
    public static final String AGENT_HEADER = "User-Agent";
    public static final String AGENT_NAME = "ComiXed/" + ComiXedApp.VERSION;
    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    private WebRequestClient clientSource;

    /**
     * Executes the provided request.
     *
     * @param request
     *            the request
     * @return the response bytes
     * @throws WebRequestException
     *             if an error occurs
     */
    public byte[] execute(WebRequest request) throws WebRequestException
    {
        String url = request.getURL();
        this.logger.debug("Executing web request: " + url);

        HttpClient client = this.clientSource.createClient();
        HttpGet getRequest = new HttpGet(url);

        getRequest.addHeader(AGENT_HEADER, AGENT_NAME);

        try
        {
            HttpResponse response = client.execute(getRequest);
            byte[] result = IOUtils.toByteArray(response.getEntity().getContent());
            this.logger.debug("Returning {} byte response", result.length);
            return result;
        }
        catch (IOException error)
        {
            throw new WebRequestException("Failed to execute request", error);
        }
    }
}
