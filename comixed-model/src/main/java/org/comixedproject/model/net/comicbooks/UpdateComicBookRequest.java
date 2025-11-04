/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2025, The ComiXed Project.
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

package org.comixedproject.model.net.comicbooks;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Date;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.comixedproject.model.comicbooks.ComicType;

/**
 * <code>UpdateComicBookRequest</code> contains the payload for a request to update a single comic
 * book's contents.
 *
 * @author Darryl L. Pierce
 */
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class UpdateComicBookRequest {
  @JsonProperty("comicType")
  @Getter
  private ComicType comicType;

  @JsonProperty("publisher")
  @Getter
  private String publisher;

  @JsonProperty("series")
  @Getter
  private String series;

  @JsonProperty("volume")
  @Getter
  private String volume;

  @JsonProperty("issueNumber")
  @Getter
  private String issueNumber;

  @JsonProperty("imprint")
  @Getter
  private String imprint;

  @JsonProperty("sortName")
  @Getter
  private String sortName;

  @JsonProperty("title")
  @Getter
  private String title;

  @JsonProperty("coverDate")
  @Getter
  private Date coverDate;

  @JsonProperty("storeDate")
  @Getter
  private Date storeDate;
}
