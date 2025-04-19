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

package org.comixedproject.metadata.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Date;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * <code>StoryIssueMetadata</code> contains the details for a single issue within a story.
 *
 * @author Darryl L. Pierce
 */
@NoArgsConstructor
public class StoryIssueMetadata {
  @JsonProperty("readingOrder")
  @Getter
  @Setter
  private int readingOrder;

  @JsonProperty("name")
  @Getter
  @Setter
  private String name;

  @JsonProperty("volume")
  @Getter
  @Setter
  private String volume;

  @JsonProperty("issueNumber")
  @Getter
  @Setter
  private String issueNumber;

  @JsonProperty("coverDate")
  @Getter
  @Setter
  private Date coverDate;
}
