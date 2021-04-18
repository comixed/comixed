/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * <code>DownloadDocument</code> describes a file that is downloaded to the frontend.
 *
 * @author Darryl L. Pierce
 */
@AllArgsConstructor
public class DownloadDocument {
  @JsonProperty("filename")
  @Getter
  private String filename;

  @JsonProperty("mediaType")
  @Getter
  private String mediaType;

  @JsonProperty("content")
  @Getter
  private byte[] content;
}
