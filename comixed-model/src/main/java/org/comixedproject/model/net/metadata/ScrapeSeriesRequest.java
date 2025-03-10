/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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

package org.comixedproject.model.net.metadata;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * <code>ScrapeSeriesRequest</code> represents the payload when the list of known issues for a
 * series are fetched.
 *
 * @author Darryl L. Pierce
 */
@NoArgsConstructor
@AllArgsConstructor
public class ScrapeSeriesRequest {
  @JsonProperty("originalPublisher")
  @Getter
  private String originalPublisher;

  @JsonProperty("originalSeries")
  @Getter
  private String originalSeries;

  @JsonProperty("originalVolume")
  @Getter
  private String originalVolume;

  @JsonProperty("volumeId")
  @Getter
  private String volumeId;
}
