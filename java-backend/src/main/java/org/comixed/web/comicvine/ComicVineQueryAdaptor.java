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
import java.util.List;

import org.comixed.web.model.ComicVolume;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;

@Component
public class ComicVineQueryAdaptor
{
    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    private ObjectMapper objectMapper;

    public byte[] execute(byte[] content) throws ComicVineAdaptorException
    {
        byte[] result = null;

        if (content == null || content.length == 0)
        {
            logger.debug("No content provided");
            result = new byte[] {};
        }
        else
        {

            try
            {
                logger.debug("Preparing to process {} bytes", content.length);
                ComicVineVolumesReponseProcessor queryResult = objectMapper.readValue(content,
                                                                                ComicVineVolumesReponseProcessor.class);
                List<ComicVolume> tranformed = queryResult.transform();

                result = objectMapper.writeValueAsBytes(tranformed);
            }
            catch (IOException error)
            {
                throw new ComicVineAdaptorException("Failed to parse volume result", error);
            }
        }

        logger.debug("Return {} bytes", result.length);
        return result;
    }
}
