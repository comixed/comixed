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

import org.comixed.library.model.Comic;
import org.comixed.library.model.comicvine.ComicVineVolume;
import org.comixed.repositories.ComicVineVolumeRepository;
import org.comixed.web.ComicVineVolumeDetailsWebRequest;
import org.comixed.web.WebRequestException;
import org.comixed.web.WebRequestProcessor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ComicVineQueryForVolumeDetailsAdaptor
{
    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    private ObjectFactory<ComicVineVolumeDetailsWebRequest> requestFactory;

    @Autowired
    private WebRequestProcessor webRequestProcessor;

    @Autowired
    private ComicVineVolumeDetailsResponseProcessor responseProcessor;

    @Autowired
    private ComicVineVolumeRepository comicVineVolumeRepository;

    public String execute(String apiKey,
                          String volumeId,
                          Comic comic,
                          boolean skipCache) throws ComicVineAdaptorException
    {
        String result = null;
        String content = null;
        ComicVineVolume volume = null;

        this.logger.debug("Fetching volume details: volumeId={}", volumeId);

        if (skipCache)
        {
            this.logger.debug("Bypassing the cache...");
        }
        else
        {
            volume = this.comicVineVolumeRepository.findByVolumeId(volumeId);
        }

        if (volume == null)
        {
            this.logger.debug("Fetching volume details from ComicVine...");

            ComicVineVolumeDetailsWebRequest request = this.requestFactory.getObject();
            request.setApiKey(apiKey);
            request.setVolumeId(volumeId);
            try
            {
                content = this.webRequestProcessor.execute(request);
                this.logger.debug("Saving retrieved volume data...");
                if (volume == null)
                {
                    volume = new ComicVineVolume();
                }
                volume.setVolumeId(volumeId);
                volume.setContent(content.toString());

                this.comicVineVolumeRepository.save(volume);
            }
            catch (WebRequestException error)
            {
                throw new ComicVineAdaptorException("Failed to get volume details", error);
            }
        }
        else
        {
            this.logger.debug("Volume found in database.");
            content = volume.getContent();
        }

        result = this.responseProcessor.process(content.getBytes(), comic);

        return result;
    }
}
