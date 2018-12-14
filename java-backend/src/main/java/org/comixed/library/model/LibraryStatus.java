/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project.
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

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;

public class LibraryStatus
{
    @JsonProperty("comics")
    @JsonView(View.ComicList.class)
    private List<Comic> comics;

    @JsonProperty("rescan_count")
    @JsonView(View.ComicList.class)
    private int rescanCount;

    @JsonProperty("import_count")
    @JsonView(View.ComicList.class)
    private int importCount;

    public LibraryStatus(List<Comic> comics, int rescanCount, int importCount)
    {
        this.comics = comics;
        this.rescanCount = rescanCount;
        this.importCount = importCount;
    }

    public List<Comic> getComics()
    {
        return this.comics;
    }

    public int getImportCount()
    {
        return this.importCount;
    }

    public int getRescanCount()
    {
        return this.rescanCount;
    }
}
