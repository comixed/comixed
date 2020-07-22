/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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

package org.comixedproject.net;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ImportRequestBody {
  @JsonProperty("filenames")
  private String[] filenames;

  @JsonProperty("ignoreMetadata")
  private boolean ignoreMetadata;

  @JsonProperty("deleteBlockedPages")
  private boolean deleteBlockedPages;

  public ImportRequestBody(
      final String[] filenames, final boolean deleteBlockedPages, final boolean ignoreMetadata) {
    this.filenames = filenames;
    this.deleteBlockedPages = deleteBlockedPages;
    this.ignoreMetadata = ignoreMetadata;
  }

  public String[] getFilenames() {
    return filenames;
  }

  public boolean isIgnoreMetadata() {
    return ignoreMetadata;
  }

  public boolean isDeleteBlockedPages() {
    return deleteBlockedPages;
  }
}
