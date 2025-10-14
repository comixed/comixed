/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2025, The ComiXed Project
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

package org.comixedproject.model.metadata;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
public class PageInfo {
  @JsonProperty("Filename")
  @Getter
  @Setter
  private String filename;

  @JsonProperty("Image")
  @Getter
  @Setter
  private Integer pageNumber;

  @JsonProperty("ImageSize")
  @Getter
  @Setter
  private Integer imageSize;

  @JsonProperty("ImageWidth")
  @Getter
  @Setter
  private Integer imageWidth;

  @JsonProperty("ImageHeight")
  @Getter
  @Setter
  private Integer imageHeight;

  @JsonProperty("Type")
  @Enumerated(EnumType.STRING)
  @Getter
  @Setter
  private PageType imageType = PageType.Story;

  @JsonProperty("ImageHash")
  @Getter
  @Setter
  private String imageHash;
}
