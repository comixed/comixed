/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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

package org.comixedproject.model.comicpages;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import lombok.Getter;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.views.View;

/**
 * <code>DeletedPage</code> represents a single deleted page entry.
 *
 * @author Darryl L. Pierce
 */
@RequiredArgsConstructor
public class DeletedPage {
  @JsonProperty("hash")
  @JsonView(View.DeletedPageList.class)
  @Getter
  @NonNull
  private String hash;

  @JsonProperty("comics")
  @JsonView(View.DeletedPageList.class)
  @Getter
  private List<ComicDetail> comics = new ArrayList<>();

  @Override
  public boolean equals(final Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    final DeletedPage that = (DeletedPage) o;
    return hash.equals(that.hash) && comics.equals(that.comics);
  }

  @Override
  public int hashCode() {
    return Objects.hash(hash, comics);
  }
}
