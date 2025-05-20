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
 * <code>ReleaseDetails</code> holds the know details for the currently running build.
 *
 * @author Darryl L. Pierce
 */
public class BuildDetails {
  @JsonProperty("branch")
  @JsonView(View.ReleaseDetails.class)
  @Getter
  @Setter
  private String branch;

  @JsonProperty("buildTime")
  @JsonView(View.ReleaseDetails.class)
  @Getter
  @Setter
  private Date buildTime;

  @JsonProperty("buildHost")
  @JsonView(View.ReleaseDetails.class)
  @Getter
  @Setter
  private String buildHost;

  @JsonProperty("buildVersion")
  @JsonView(View.ReleaseDetails.class)
  @Getter
  @Setter
  private String buildVersion;

  @JsonProperty("commitTime")
  @JsonView(View.ReleaseDetails.class)
  @Getter
  @Setter
  private Date commitTime;

  @JsonProperty("dirty")
  @JsonView(View.ReleaseDetails.class)
  @Getter
  @Setter
  private boolean dirty;

  @JsonProperty("remoteOriginURL")
  @JsonView(View.ReleaseDetails.class)
  @Getter
  @Setter
  private String remoteOriginURL;

  @JsonProperty("jdbcUrl")
  @JsonView(View.ReleaseDetails.class)
  @Getter
  @Setter
  private String jdbcUrl;

  @JsonProperty("javaVersion")
  @JsonView(View.ReleaseDetails.class)
  @Getter
  @Setter
  private String javaVersion;

  @JsonProperty("javaVendor")
  @JsonView(View.ReleaseDetails.class)
  @Getter
  @Setter
  private String javaVendor;

  @JsonProperty("osName")
  @JsonView(View.ReleaseDetails.class)
  @Getter
  @Setter
  private String osName;

  @JsonProperty("osArch")
  @JsonView(View.ReleaseDetails.class)
  @Getter
  @Setter
  private String osArch;

  @JsonProperty("osVersion")
  @JsonView(View.ReleaseDetails.class)
  @Getter
  @Setter
  private String osVersion;
}
