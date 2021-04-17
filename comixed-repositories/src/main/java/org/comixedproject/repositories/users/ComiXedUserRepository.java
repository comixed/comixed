/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project
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

package org.comixedproject.repositories.users;

import org.comixedproject.model.user.ComiXedUser;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

/**
 * <code>ComiXedUserRepository</code> provides APIs for working with persistenced instances of
 * {@link ComiXedUser}.
 *
 * @author Darryl L. Pierce
 */
public interface ComiXedUserRepository extends CrudRepository<ComiXedUser, Long> {
  /**
   * Find a single user by email address.
   *
   * @param email the email address
   * @return the user, or null if not found
   */
  ComiXedUser findByEmail(String email);

  /**
   * Retrieves a user by record id.
   *
   * @param id the record id.
   * @return the user record
   */
  @Query("SELECT u FROM ComiXedUser u WHERE u.id = :id")
  ComiXedUser getById(@Param("id") long id);
}
