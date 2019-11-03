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

import org.springframework.stereotype.Component;

/**
 * <code>ComicVineVolumesWebRequest</code> defines a concrete implementation of
 * {@link AbstractComicVineWebRequest} for retrieving a list of issues for a volume.
 *
 * @author Darryl L. Pierce
 */
@Component
public class ComicVineIssuesWebRequest
        extends AbstractComicVineWebRequest {
    public ComicVineIssuesWebRequest() {
        super("issues");
        this.parameterSet.put("field_list",
                              "cover_date,description,id,image,issue_number,name,store_date,volume");
    }

    @Override
    public String getURL()
            throws
            WebRequestException {
        if (!this.filterset.containsKey("issue_number")) {
            throw new WebRequestException("Missing required filter: issue_number");
        }
        if (!this.filterset.containsKey("volume")) { throw new WebRequestException("Missing required filter: volume"); }
        return super.getURL();
    }

    public void setIssueNumber(String issueNumber) {
        this.filterset.put("issue_number",
                           issueNumber);
    }

    public void setVolume(Integer volume) {
        this.filterset.put("volume",
                           volume.toString());
    }
}
