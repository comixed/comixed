/*
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

package org.comixedproject.model.library;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;
import java.util.HashSet;
import java.util.Set;
import lombok.Getter;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.views.View;

/**
 * <code>DuplicatePage</code> represents a page that appears in more than one comic.
 *
 * @author Darryl L. Pierce
 */
@RequiredArgsConstructor
public class DuplicatePage {
  @JsonProperty("hash")
  @JsonView(View.DuplicatePageList.class)
  @NonNull
  @Getter
  private String hash;

  @JsonProperty("blocked")
  @JsonView(View.DuplicatePageList.class)
  @NonNull
  @Getter
  private boolean blocked;

  @JsonProperty("comics")
  @JsonView(View.DuplicatePageList.class)
  @Getter
  @Setter
  private Set<Comic> comics = new HashSet<>();
}
