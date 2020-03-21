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

package org.comixed.service.core;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import lombok.extern.log4j.Log4j2;
import org.comixed.model.core.BuildDetails;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.stereotype.Service;

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

  public BuildDetails getBuildDetails() throws ParseException {
    this.log.debug("Getting build details");
    final BuildDetails result = new BuildDetails();

    result.setBranch(branch);
    result.setBuildHost(buildHost);
    result.setBuildTime(dateParser.parse(buildTime));
    result.setBuildVersion(buildVersion);
    result.setCommitId(commitId);
    result.setCommitTime(dateParser.parse(commitTime));
    result.setCommitMessage(commitMessage);
    result.setCommitUser(commitUser);
    result.setCommitEmail(commitEmail);
    result.setDirty(Boolean.valueOf(dirty));
    result.setRemoteOriginURL(remoteOriginURL);

    return result;
  }
}
