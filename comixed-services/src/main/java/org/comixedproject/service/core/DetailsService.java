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

package org.comixedproject.service.core;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.core.BuildDetails;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@PropertySource({"classpath:/build-details.properties"})
@Log4j2
public class DetailsService {
  private SimpleDateFormat dateParser = new SimpleDateFormat("yyyyMMddhhmmss");

  @Value("${build-details.branch}")
  private String branch;

  @Value("${build-details.build.host}")
  private String buildHost;

  @Value("${build-details.build.time}")
  private String buildTime;

  @Value("${build-details.build.version}")
  private String buildVersion;

  @Value("${build-details.commit.id}")
  private String commitId;

  @Value("${build-details.commit.time}")
  private String commitTime;

  @Value("${build-details.commit.message.short}")
  private String commitMessage;

  @Value("${build-details.commit.user.name}")
  private String commitUser;

  @Value("${build-details.commit.user.email}")
  private String commitEmail;

  @Value("${build-details.dirty}")
  private String dirty;

  @Value("${build-details.remote.origin.url}")
  private String remoteOriginURL;

  @Value("${spring.datasource.url}")
  private String jdbcUrl;

  private BuildDetails buildDetails = null;

  public BuildDetails getBuildDetails() throws ParseException {
    log.debug("Getting build details");
    if (this.buildDetails == null) {
      this.buildDetails = new BuildDetails();

      this.buildDetails.setBranch(this.branch);
      this.buildDetails.setBuildHost(this.buildHost);
      if (!StringUtils.isEmpty(this.buildTime))
        this.buildDetails.setBuildTime(dateParser.parse(this.buildTime));
      this.buildDetails.setBuildVersion(this.buildVersion);
      this.buildDetails.setCommitId(this.commitId);
      if (!StringUtils.isEmpty(this.commitTime))
        this.buildDetails.setCommitTime(dateParser.parse(this.commitTime));
      this.buildDetails.setCommitMessage(this.commitMessage);
      this.buildDetails.setCommitUser(this.commitUser);
      this.buildDetails.setCommitEmail(this.commitEmail);
      this.buildDetails.setDirty(Boolean.valueOf(this.dirty));
      this.buildDetails.setRemoteOriginURL(this.remoteOriginURL);
      this.buildDetails.setJdbcUrl(this.jdbcUrl);
    }

    return this.buildDetails;
  }
}
