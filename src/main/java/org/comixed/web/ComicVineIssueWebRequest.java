/*
 * ComixEd - A digital comic book library management application.
 * Copyright (C) 2017, Darryl L. Pierce
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

import java.text.MessageFormat;

import org.springframework.stereotype.Component;

/**
 * <code>ComicVineVolumesWebRequest</code> defines a concrete implementation of
 * {@link AbstractComicVineWebRequest} for retrieving a single issue's details.
 * 
 * @author Darryl L. Pierce
 *
 */
@Component
public class ComicVineIssueWebRequest extends AbstractComicVineWebRequest
{
    public ComicVineIssueWebRequest()
    {
        super(null);
    }

    /**
     * Sets the issue ID for the request.
     * 
     * @param id
     *            the id
     */
    public void setIssueId(String id)
    {
        this.endpoint = MessageFormat.format("issue/4000-{0}", id);
    }
}
