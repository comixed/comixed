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

package org.comixed.model.opds;

/**
 * <code>OPDSLink</code> provides references to content within a single OPDS
 * feed.
 *
 * @author Darryl L. Pierce
 * @author Giao Phan
 *
 */
public class OPDSLink
{
    private String type;
    private String rel;
    private String href;

    public OPDSLink(String type, String rel, String href)
    {
        this.type = type;
        this.rel = rel;
        this.href = href;
    }

    public String getHRef()
    {
        return this.href;
    }

    public String getRel()
    {
        return this.rel;
    }

    public String getType()
    {
        return this.type;
    }
}
