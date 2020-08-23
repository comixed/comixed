/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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

package org.comixedproject.model.net.library;

import com.fasterxml.jackson.annotation.JsonProperty;

public class MoveComicsRequest {
  @JsonProperty("deletePhysicalFiles")
  private Boolean deletePhysicalFiles;

  @JsonProperty("targetDirectory")
  private String targetDirectory;

  @JsonProperty("renamingRule")
  private String renamingRule;

  public MoveComicsRequest(
      Boolean deletePhysicalFiles, String targetDirectory, String renamingRule) {
    this.deletePhysicalFiles = deletePhysicalFiles;
    this.targetDirectory = targetDirectory;
    this.renamingRule = renamingRule;
  }

  public Boolean getDeletePhysicalFiles() {
    return deletePhysicalFiles;
  }

  public String getTargetDirectory() {
    return targetDirectory;
  }

  public String getRenamingRule() {
    return renamingRule;
  }
}
