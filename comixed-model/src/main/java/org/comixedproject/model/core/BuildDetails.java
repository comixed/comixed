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

  @JsonProperty("build_time")
  @Getter
  @Setter
  private Date buildTime;

  @JsonProperty("build_host")
  @Getter
  @Setter
  private String buildHost;

  @JsonProperty("build_version")
  @Getter
  @Setter
  private String buildVersion;

  @JsonProperty("commit_id")
  @Getter
  @Setter
  private String commitId;

  @JsonProperty("commit_time")
  @Getter
  @Setter
  private Date commitTime;

  @JsonProperty("commit_message")
  @Getter
  @Setter
  private String commitMessage;

  @JsonProperty("commit_user")
  @Getter
  @Setter
  private String commitUser;

  @JsonProperty("commit_email")
  @Getter
  @Setter
  private String commitEmail;

  @JsonProperty("dirty")
  @Getter
  @Setter
  private boolean dirty;

  @JsonProperty("remote_origin_url")
  @Getter
  @Setter
  private String remoteOriginURL;
}
