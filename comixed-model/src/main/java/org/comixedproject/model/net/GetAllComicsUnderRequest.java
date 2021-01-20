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

package org.comixedproject.model.net;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * <code>GetAllComicsUnderRequest</code> represents the request body during comic file imports.
 *
 * @author Darryl L. Pierce
 */
public class GetAllComicsUnderRequest {
  @JsonProperty("directory")
  private String directory;

  @JsonProperty("maximum")
  private Integer maximum;

  public GetAllComicsUnderRequest() {}

  public GetAllComicsUnderRequest(final String directory, final Integer maximum) {
    this.directory = directory;
    this.maximum = maximum;
  }

  /**
   * The root directory to be searched.
   *
   * @return the directory
   */
  public String getDirectory() {
    return directory;
  }

  /**
   * The maximum number of comics to find. If the value is zero then then all comics found are
   * returned.
   *
   * @return the maximum
   */
  public Integer getMaximum() {
    return maximum;
  }
}
