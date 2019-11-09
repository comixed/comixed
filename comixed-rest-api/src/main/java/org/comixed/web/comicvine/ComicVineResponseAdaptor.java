/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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

package org.comixed.web.comicvine;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class ComicVineResponseAdaptor {
    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired private ObjectMapper objectMapper;

    public void checkForErrors(final byte[] content)
            throws
            ComicVineAdaptorException {
        JsonNode root = null;

        this.logger.debug("Verifying that the content is JSON");
        try {
            root = objectMapper.readTree(content);
        }
        catch (IOException error) {
            throw new ComicVineAdaptorException("content not JSON",
                                                error);
        }

        this.logger.debug("Checking the response node count");
        if (root.size() == 0) {
            throw new ComicVineAdaptorException("content is empty JSON");
        }

        this.logger.debug("Checking the error node value");
        String errorValue = "";

        try {
            errorValue = root.get("error")
                             .asText();
        }
        catch (NullPointerException error) {
            throw new ComicVineAdaptorException("missing error node");
        }

        this.logger.debug("Node value={}",
                          errorValue);

        if (!"OK".equals(errorValue)) {
            throw new ComicVineAdaptorException("error response received");
        }
    }
}
