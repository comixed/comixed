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

package org.comixed.web.comicvine;

import java.io.IOException;

import org.comixed.library.model.Comic;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Component
public class ComicVinePublisherDetailsResponseProcessor
{
    @Autowired
    private ObjectMapper objectMapper;

    public void process(byte[] content, Comic comic) throws ComicVineAdaptorException
    {
        try
        {
            JsonNode jsonNode = this.objectMapper.readTree(content);

            comic.setPublisher(jsonNode.get("results").get("name").asText());
        }
        catch (IOException error)
        {
            throw new ComicVineAdaptorException("Failed to get publisher details", error);
        }
    }

}
