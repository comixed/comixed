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
 * along with this program. If not, see <http:/www.gnu.org/licenses>
 */

package org.comixedproject.model.net;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import lombok.Getter;
import lombok.Setter;
import org.comixedproject.model.archives.ArchiveType;

/**
 * <code>ConvertComicsRequest</code> provides the HTTP request contents when converting comics.
 *
 * @author Darryl L. Pierce
 */
public class ConvertComicsRequest {
  @Getter
  @Setter
  @JsonProperty("ids")
  private List<Long> comicIdList;

  @Getter
  @Setter
  @JsonProperty("archiveType")
  private ArchiveType archiveType;

  @Getter
  @Setter
  @JsonProperty("renamePages")
  private boolean renamePages;

  @Getter
  @Setter
  @JsonProperty("deletePages")
  private boolean deletePages;

  @Getter
  @Setter
  @JsonProperty("deleteOriginal")
  private boolean deleteOriginal;

  public ConvertComicsRequest(
      final List<Long> comicIdList,
      final ArchiveType archiveType,
      final boolean renamePages,
      final Boolean deletePages,
      final boolean deleteOriginal) {
    this.comicIdList = comicIdList;
    this.archiveType = archiveType;
    this.renamePages = renamePages;
    this.deletePages = deletePages;
    this.deleteOriginal = deleteOriginal;
  }
}
