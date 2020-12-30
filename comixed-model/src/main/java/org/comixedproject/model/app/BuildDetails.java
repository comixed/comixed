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

package org.comixedproject.model.app;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;
import java.util.Date;
import lombok.Getter;
import lombok.Setter;
import org.comixedproject.views.View;

/**
 * <code>BuildDetails</code> holds the know details for the currently running build.
 *
 * @author Darryl L. Pierce
 */
public class BuildDetails {
  @JsonProperty("branch")
  @JsonView(View.BuildDetails.class)
  @Getter
  @Setter
  private String branch;

  @JsonProperty("buildTime")
  @JsonView(View.BuildDetails.class)
  @Getter
  @Setter
  private Date buildTime;

  @JsonProperty("buildHost")
  @JsonView(View.BuildDetails.class)
  @Getter
  @Setter
  private String buildHost;

  @JsonProperty("buildVersion")
  @JsonView(View.BuildDetails.class)
  @Getter
  @Setter
  private String buildVersion;

  @JsonProperty("commitId")
  @JsonView(View.BuildDetails.class)
  @Getter
  @Setter
  private String commitId;

  @JsonProperty("commitTime")
  @JsonView(View.BuildDetails.class)
  @Getter
  @Setter
  private Date commitTime;

  @JsonProperty("commitMessage")
  @JsonView(View.BuildDetails.class)
  @Getter
  @Setter
  private String commitMessage;

  @JsonProperty("commitUser")
  @JsonView(View.BuildDetails.class)
  @Getter
  @Setter
  private String commitUser;

  @JsonProperty("commitEmail")
  @JsonView(View.BuildDetails.class)
  @Getter
  @Setter
  private String commitEmail;

  @JsonProperty("dirty")
  @JsonView(View.BuildDetails.class)
  @Getter
  @Setter
  private boolean dirty;

  @JsonProperty("remoteOriginURL")
  @JsonView(View.BuildDetails.class)
  @Getter
  @Setter
  private String remoteOriginURL;

  @JsonProperty("jdbcUrl")
  @JsonView(View.BuildDetails.class)
  @Getter
  @Setter
  private String jdbcUrl;
}
