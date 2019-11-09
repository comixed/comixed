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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

package org.comixed.model.file;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.h2.store.fs.FileUtils;

public class FileDetails {
    private static int COUNT = 0;

    @JsonProperty("id") private int id = ++COUNT;
    @JsonProperty("filename") private String filename;
    @JsonProperty("baseFilename") private String baseFilename;
    @JsonProperty("size") private long size;

    public FileDetails(final String filename,
                       final long size) {
        this.baseFilename = FileUtils.getName(filename);
        this.filename = filename.replaceAll("\\\\",
                                            "/");
        this.size = size;
    }

    public int getId() { return id; }

    public String getFilename() {
        return filename;
    }

    public long getSize() {
        return size;
    }

    public String getBaseFilename() {
        return baseFilename;
    }
}
