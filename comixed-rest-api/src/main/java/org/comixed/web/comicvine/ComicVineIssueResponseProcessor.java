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
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.comixed.web.model.ComicIssue;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;

@Component
public class ComicVineIssueResponseProcessor
{
    static class ComicVineIssue
    {
        @JsonProperty(value = "id")
        int id;

        @JsonProperty(value = "issue_number")
        String issueNumber;

        @JsonProperty(value = "cover_date")
        String coverDate;

        @JsonProperty(value = "image")
        Map<String,
            String> imageUrls = new HashMap<>();

        @JsonProperty(value = "volume")
        Map<String,
            String> volume = new HashMap<>();

        public ComicIssue toComicIssue()
        {
            ComicIssue result = new ComicIssue();

            result.setId(this.id);
            result.setIssueNumber(this.issueNumber);
            result.setCoverDate(this.coverDate);
            result.setCoverUrl(this.imageUrls.containsKey("original_url") ? this.imageUrls.get("original_url") : "");
            result.setVolumeName(this.volume.get("name"));
            result.setVolumeId(Integer.valueOf(this.volume.containsKey("id") ? this.volume.get("id") : "0").intValue());

            return result;
        }
    }

    static class ComicVineIssueResponse
    {
        @JsonProperty(value = "results")
        List<ComicVineIssue> comicVineIssues;

        public ComicIssue getIssue()
        {
            return ((this.comicVineIssues != null)
                    && !this.comicVineIssues.isEmpty()) ? this.comicVineIssues.get(0).toComicIssue() : null;
        }
    }

    @Autowired
    private ObjectMapper objectMapper;

    public ComicIssue process(byte[] content) throws ComicVineAdaptorException
    {
        ComicIssue result = null;

        try
        {
            // TODO there HAS to be a better way to configure this
            this.objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
            ComicVineIssueResponse response = this.objectMapper.readValue(content, ComicVineIssueResponse.class);
            result = response.getIssue();
        }
        catch (IOException error)
        {
            throw new ComicVineAdaptorException("Error processing issues response", error);
        }

        return result;
    }
}
