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

package org.comixedproject.model.net.app;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;
import java.util.Date;
import lombok.*;
import org.comixedproject.views.View;

/**
 * <code>LatestReleaseDetails</code> contains the details for a release of ComiXed.
 *
 * @author Darryl L. Pierce
 */
@NoArgsConstructor
@RequiredArgsConstructor
public class LatestReleaseDetails {
  @JsonProperty("version")
  @JsonView(View.ReleaseDetails.class)
  @NonNull
  @Getter
  private String version;

  @JsonProperty("url")
  @JsonView(View.ReleaseDetails.class)
  @NonNull
  @Getter
  private String url;

  @JsonProperty("updated")
  @JsonFormat(shape = JsonFormat.Shape.NUMBER_INT)
  @JsonView(View.ReleaseDetails.class)
  @NonNull
  @Getter
  private Date released;

  @JsonProperty("newer")
  @JsonView(View.ReleaseDetails.class)
  @Getter
  @Setter
  private Boolean newer = false;
}
