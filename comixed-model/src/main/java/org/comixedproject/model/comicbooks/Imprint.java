/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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

/**
 * <code>Imprint</code> represents a subsidiary of a publisher.
 *
 * @author Darryl L. Pierce
 */
@Entity
@Table(name = "Imprints")
public class Imprint {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Getter
  private Long id;

  @Column(name = "Name", length = 128, nullable = false, updatable = false, unique = true)
  @Getter
  private String name;

  @Column(name = "Publisher", length = 128, nullable = false, updatable = false)
  @Getter
  private String publisher;

  @Override
  public boolean equals(final Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    final Imprint imprint = (Imprint) o;
    return Objects.equals(name, imprint.name) && Objects.equals(publisher, imprint.publisher);
  }

  @Override
  public int hashCode() {
    return Objects.hash(name, publisher);
  }
}
