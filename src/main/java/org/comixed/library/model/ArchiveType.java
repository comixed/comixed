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

package org.comixed.library.model;

import org.comixed.library.adaptors.ArchiveAdaptor;

/**
 * <code>ArchiveType</code> provides a means for association a
 * {@link ArchiveAdaptor} to a disk format.
 *
 * @author Darryl L. Pierce
 *
 */
public enum ArchiveType
{
 CBZ("ZIP Comic"),
 CBR("RAR Comic"),
 CB7("7Z Comic");

    private String name;
    private ArchiveAdaptor archiveAdaptor;

    private ArchiveType(String name)
    {
        this.name = name;
    }

    public ArchiveAdaptor getArchiveAdaptor()
    {
        return this.archiveAdaptor;
    }

    public void setArchiveAdaptor(ArchiveAdaptor archiveAdaptor)
    {
        this.archiveAdaptor = archiveAdaptor;
    }

    @Override
    public String toString()
    {
        return this.name;
    }
}
