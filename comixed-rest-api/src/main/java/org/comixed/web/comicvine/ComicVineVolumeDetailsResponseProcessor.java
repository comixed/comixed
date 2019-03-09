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

import java.io.IOException;

import org.comixed.library.model.Comic;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Component
public class ComicVineVolumeDetailsResponseProcessor
{
    @Autowired
    private ObjectMapper objectMapper;

    public String process(byte[] content, Comic comic) throws ComicVineAdaptorException
    {
        String result = null;
        try
        {
            JsonNode jsonNode = objectMapper.readTree(content);

            comic.setVolume(jsonNode.get("results").get("start_year").asText());
            comic.setSeries(jsonNode.get("results").get("name").asText());
            result = jsonNode.get("results").get("publisher").get("id").asText();
        }
        catch (IOException error)
        {
            throw new ComicVineAdaptorException("Invalid response content", error);
        }

        return result;
    }
}
