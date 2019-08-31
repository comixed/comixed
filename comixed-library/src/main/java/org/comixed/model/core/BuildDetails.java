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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

package org.comixed.model.core;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Date;

public class BuildDetails {
    @JsonProperty("branch") private String branch;
    @JsonProperty("build_time") private Date buildTime;
    @JsonProperty("build_host") private String buildHost;
    @JsonProperty("build_version") private String buildVersion;
    @JsonProperty("commit_id") private String commitId;
    @JsonProperty("commit_time") private Date commitTime;
    @JsonProperty("commit_message") private String commitMessage;
    @JsonProperty("commit_user") private String commitUser;
    @JsonProperty("commit_email") private String commitEmail;
    @JsonProperty("dirty") private boolean dirty;
    @JsonProperty("remote_origin_url") private String remoteOriginURL;

    public String getCommitMessage() {
        return commitMessage;
    }

    public void setCommitMessage(final String commitMessage) {
        this.commitMessage = commitMessage;
    }

    public String getCommitUser() {
        return commitUser;
    }

    public void setCommitUser(final String commitUser) {
        this.commitUser = commitUser;
    }

    public String getCommitEmail() {
        return commitEmail;
    }

    public void setCommitEmail(final String commitEmail) {
        this.commitEmail = commitEmail;
    }

    public boolean isDirty() {
        return dirty;
    }

    public void setDirty(final boolean dirty) {
        this.dirty = dirty;
    }

    public String getRemoteOriginURL() {
        return remoteOriginURL;
    }

    public void setRemoteOriginURL(final String remoteOriginURL) {
        this.remoteOriginURL = remoteOriginURL;
    }

    public String getBuildHost() {
        return buildHost;
    }

    public void setBuildHost(final String buildHost) {
        this.buildHost = buildHost;
    }

    public String getBranch() {
        return branch;
    }

    public void setBranch(final String branch) {
        this.branch = branch;
    }

    public Date getBuildTime() {
        return buildTime;
    }

    public void setBuildTime(final Date buildTime) {
        this.buildTime = buildTime;
    }

    public String getBuildVersion() {
        return buildVersion;
    }

    public void setBuildVersion(final String buildVersion) {
        this.buildVersion = buildVersion;
    }

    public String getCommitId() {
        return commitId;
    }

    public void setCommitId(final String commitId) {
        this.commitId = commitId;
    }

    public Date getCommitTime() {
        return commitTime;
    }

    public void setCommitTime(final Date commitTime) {
        this.commitTime = commitTime;
    }
}
