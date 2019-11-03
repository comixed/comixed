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

package org.comixed.web.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ScrapingIssue {
    @JsonProperty(value = "id") private int id;
    @JsonProperty(value = "coverDate") private String coverDate;
    @JsonProperty(value = "coverUrl") private String coverUrl;
    @JsonProperty(value = "issueNumber") private String issueNumber;
    @JsonProperty(value = "description") private String description;
    @JsonProperty(value = "name") private String name;
    @JsonProperty(value = "volumeName") private String volumeName;
    @JsonProperty(value = "volumeId") private int volumeId;

    public String getCoverDate() {
        return this.coverDate;
    }

    public String getCoverUrl() {
        return this.coverUrl;
    }

    public String getDescription() {
        return this.description;
    }

    public int getId() {
        return this.id;
    }

    public String getIssueNumber() {
        return this.issueNumber;
    }

    public String getName() {
        return this.name;
    }

    public int getVolumeId() {
        return this.volumeId;
    }

    public String getVolumeName() {
        return this.volumeName;
    }

    public void setCoverDate(String coverDate) {
        this.coverDate = coverDate;
    }

    public void setCoverUrl(String coverUrl) {
        this.coverUrl = coverUrl;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setId(int id) {
        this.id = id;
    }

    public void setIssueNumber(String issueNumber) {
        this.issueNumber = issueNumber;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setVolumeId(int volumeId) {
        this.volumeId = volumeId;
    }

    public void setVolumeName(String volumeName) {
        this.volumeName = volumeName;
    }
}
