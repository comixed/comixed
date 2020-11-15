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

package org.comixedproject.model.file;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;
import liquibase.util.file.FilenameUtils;
import lombok.Getter;
import org.comixedproject.views.View;

/**
 * <code>ComicFile</code> contains the basic information for a comic file during the import process.
 *
 * @author Darryl L. Pierce
 */
public class ComicFile {
  private static int count = 0;

  @JsonProperty("id")
  @Getter
  @JsonView(View.ComicFileList.class)
  private int id = ++count;

  @JsonProperty("filename")
  @Getter
  @JsonView(View.ComicFileList.class)
  private String filename;

  @JsonProperty("baseFilename")
  @Getter
  @JsonView(View.ComicFileList.class)
  private String baseFilename;

  @JsonProperty("size")
  @Getter
  @JsonView(View.ComicFileList.class)
  private long size;

  public ComicFile(final String filename, final long size) {
    this.filename = filename.replace("\\", "/");
    this.baseFilename = FilenameUtils.getName(this.filename);
    this.size = size;
  }
}
