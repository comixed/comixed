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

package org.comixedproject.model.comicbooks;

import java.util.Objects;
import javax.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.comixedproject.model.user.ComiXedUser;

/**
 * <code>ComicSelection</code> represents a single selection of a {@link ComicDetail} by a {@link
 * ComiXedUser}.
 *
 * @author Darryl L. Pierce
 */
@Entity
@Table(name = "ComicSelections")
@NoArgsConstructor
@RequiredArgsConstructor
public class ComicSelection {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Getter
  private Long id;

  @ManyToOne
  @JoinColumn(name = "ComiXedUserId", nullable = false, updatable = false)
  @Getter
  @NonNull
  private ComiXedUser user;

  @ManyToOne
  @JoinColumn(name = "ComicBookId", nullable = false, updatable = false)
  @Getter
  @NonNull
  private ComicBook comicBook;

  @Override
  public boolean equals(final Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    final ComicSelection that = (ComicSelection) o;
    return Objects.equals(user, that.user) && Objects.equals(comicBook, that.comicBook);
  }

  @Override
  public int hashCode() {
    return Objects.hash(user, comicBook);
  }

  @Override
  public String toString() {
    return "ComicSelection{" + "id=" + id + ", user=" + user + ", comicDetail=" + comicBook + '}';
  }
}
