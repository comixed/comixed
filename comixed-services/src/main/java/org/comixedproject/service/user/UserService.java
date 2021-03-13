/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project.
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

package org.comixedproject.service.user;

import java.util.Date;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.repositories.RoleRepository;
import org.comixedproject.repositories.users.ComiXedUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Log4j2
public class UserService {
  @Autowired private ComiXedUserRepository userRepository;
  @Autowired private RoleRepository roleRepository;

  /**
   * Finds a user by email address.
   *
   * @param email the email address
   * @return the user
   * @throws ComiXedUserException if no such user is found.
   */
  public ComiXedUser findByEmail(String email) throws ComiXedUserException {
    log.debug("Finding user by email: {}", email);

    final ComiXedUser result = this.userRepository.findByEmail(email);

    if (result == null) {
      log.warn("No such user: {}", email);
      throw new ComiXedUserException("No such user: " + email);
    }

    log.debug("Found user: id={}", result.getId());

    return result;
  }

  /**
   * Sets a user property.
   *
   * @param email the user's email
   * @param propertyName the property name
   * @param propertyValue the property value
   * @return the updated user
   * @throws ComiXedUserException if the user was not found
   */
  public ComiXedUser setUserProperty(
      final String email, final String propertyName, final String propertyValue)
      throws ComiXedUserException {
    log.debug(
        "Setting user property: email={} property[{}]={}", email, propertyName, propertyValue);

    final ComiXedUser user = this.userRepository.findByEmail(email);

    if (user == null) throw new ComiXedUserException("Invalid user: " + email);
    user.setProperty(propertyName, propertyValue);

    return this.userRepository.save(user);
  }

  /**
   * Deletes a user property by name.
   *
   * @param email the user's email
   * @param property the property name
   * @return the updated user
   * @throws ComiXedUserException if the user was not found
   */
  @Transactional
  public ComiXedUser deleteUserProperty(final String email, final String property)
      throws ComiXedUserException {
    log.debug("Deleting user property: email={} property={}", email, property);
    final ComiXedUser user = this.userRepository.findByEmail(email);
    if (user == null) throw new ComiXedUserException("Invalid user: " + email);
    user.deleteProperty(property);
    return this.userRepository.save(user);
  }

  /**
   * Updates the last logged in date for the user.
   *
   * @param user the user
   * @return the updated user
   */
  public ComiXedUser updateLastLoggedInDate(final ComiXedUser user) {
    log.debug("Updating last logged in date for user: {}", user.getEmail());
    user.setLastLoginDate(new Date());
    return this.userRepository.save(user);
  }
}
