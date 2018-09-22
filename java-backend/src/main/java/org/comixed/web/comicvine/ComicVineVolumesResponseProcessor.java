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
import java.util.ArrayList;
import java.util.List;

import org.comixed.web.model.ComicVolume;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * <code>ComicVineVolumesResponseProcessor</code> represents a single volume
 * entry from the ComicVine database.
 *
 * @author Darryl L. Pierce
 *
 */
@Component
public class ComicVineVolumesResponseProcessor
{
    @Autowired
    private ObjectMapper objectMapper;

    static class ComicVineVolumesReponseContainer
    {
        @JsonProperty(value = "error")
        String statusText;

        @JsonProperty(value = "limit")
        int limit;

        @JsonProperty(value = "offset")
        int offset;

        @JsonProperty(value = "number_of_page_results")
        int numberOfPageResults;

        @JsonProperty(value = "number_of_total_results")
        int numberOfTotalResults;

        @JsonProperty(value = "status_code")
        int statusCode;

        @JsonProperty(value = "results")
        private List<ComicVineVolume> volumes = new ArrayList<>();

        public int getLimit()
        {
            return this.limit;
        }

        public int getOffset()
        {
            return this.offset;
        }

        public int getStatusCode()
        {
            return this.statusCode;
        }

        public String getStatusText()
        {
            return this.statusText;
        }

        public int getNumberOfPageResults()
        {
            return this.numberOfPageResults;
        }

        public int getNumberOfTotalResults()
        {
            return this.numberOfTotalResults;
        }

        public List<ComicVolume> getVolumes()
        {
            List<ComicVolume> result = new ArrayList<>();

            for (ComicVineVolume comicVineVolume : this.volumes)
            {
                ComicVolume volume = new ComicVolume();

                volume.setId(comicVineVolume.id);
                volume.setIssueCount(comicVineVolume.getIssueCount());
                volume.setName(comicVineVolume.getName());
                volume.setImageURL(comicVineVolume.getImageURL());
                volume.setStartYear(comicVineVolume.getStartYear());
                volume.setPublisher(comicVineVolume.getPublisher());

                result.add(volume);
            }

            return result;
        }

        public boolean isLastPage()
        {
            return (this.offset + this.numberOfPageResults) >= this.numberOfTotalResults;
        }
    }

    /**
     * Processes the supplied response content, appending the retrieved volumes
     * into the supplied list.
     * 
     * @param list
     *            the list of comic volumes
     * @param content
     *            the response content
     * @return true if there is no more data to process
     * @throws ComicVineAdaptorException
     *             if an error occurs
     */
    public boolean process(List<ComicVolume> list, byte[] content) throws ComicVineAdaptorException
    {
        boolean result = true;

        try
        {
            // TODO there HAS to be a better way to configure this
            objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
            ComicVineVolumesReponseContainer response = objectMapper.readValue(content,
                                                                               ComicVineVolumesReponseContainer.class);

            list.addAll(response.getVolumes());
            result = response.isLastPage();
        }
        catch (IOException error)
        {
            throw new ComicVineAdaptorException("failed to process volume response", error);
        }

        return result;
    }
}
