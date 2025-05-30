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

package org.comixedproject.reader.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Date;
import lombok.Getter;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;

/**
 * <code>ComicBookInfo</code> represents the details for a single comic book in a directory.
 *
 * @author Darryl L. Pierce
 */
@RequiredArgsConstructor
public class ComicBookInfo {
  @JsonProperty("id")
  @Getter
  @NonNull
  private String id;

  @JsonProperty("publisher")
  @Getter
  @NonNull
  private String publisher;

  @JsonProperty("series")
  @Getter
  @NonNull
  private String series;

  @JsonProperty("volume")
  @Getter
  @NonNull
  private String volume;

  @JsonProperty("issueNumber")
  @Getter
  @NonNull
  private String issueNumber;

  @JsonProperty("coverDate")
  @Getter
  @NonNull
  private Date coverDate;

  @JsonProperty("storeDate")
  @Getter
  @NonNull
  private Date storeDate;
}
