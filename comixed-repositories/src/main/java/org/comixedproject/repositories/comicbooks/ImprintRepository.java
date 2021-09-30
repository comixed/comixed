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

package org.comixedproject.repositories.comicbooks;

import org.comixedproject.model.comicbooks.Imprint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * <code>ImprintRepository</code> provides persistence methods for instances of {@link Imprint}.
 *
 * @author Darryl L. Pierce
 */
@Repository
public interface ImprintRepository extends JpaRepository<Imprint, Long> {
  /**
   * Finds a single imprint by name.
   *
   * @param name the imprint name
   * @return the imprint
   */
  Imprint findByName(String name);
}
