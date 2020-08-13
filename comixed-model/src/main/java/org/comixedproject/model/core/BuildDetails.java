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

package org.comixedproject.model.core;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Date;
import lombok.Getter;
import lombok.Setter;

/**
 * <code>BuildDetails</code> holds the know details for the currently running build.
 *
 * @author Darryl L. Pierce
 */
public class BuildDetails {
  @JsonProperty("branch")
  @Getter
  @Setter
  private String branch;

  @JsonProperty("buildTime")
  @Getter
  @Setter
  private Date buildTime;

  @JsonProperty("buildHost")
  @Getter
  @Setter
  private String buildHost;

  @JsonProperty("buildVersion")
  @Getter
  @Setter
  private String buildVersion;

  @JsonProperty("commitId")
  @Getter
  @Setter
  private String commitId;

  @JsonProperty("commitTime")
  @Getter
  @Setter
  private Date commitTime;

  @JsonProperty("commitMessage")
  @Getter
  @Setter
  private String commitMessage;

  @JsonProperty("commitUser")
  @Getter
  @Setter
  private String commitUser;

  @JsonProperty("commitEmail")
  @Getter
  @Setter
  private String commitEmail;

  @JsonProperty("dirty")
  @Getter
  @Setter
  private boolean dirty;

  @JsonProperty("remoteOriginURL")
  @Getter
  @Setter
  private String remoteOriginURL;

  @JsonProperty("jdbcUrl")
  @Getter
  @Setter
  private String jdbcUrl;
}
