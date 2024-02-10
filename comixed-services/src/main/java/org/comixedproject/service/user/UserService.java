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

import static org.comixedproject.model.user.ComiXedRole.ADMIN_ROLE;
import static org.comixedproject.model.user.ComiXedRole.READER_ROLE;

import java.util.Date;
import java.util.stream.Collectors;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.lang.StringUtils;
import org.comixedproject.adaptors.GenericUtilitiesAdaptor;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.messaging.user.PublishCurrentUserAction;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.repositories.users.ComiXedRoleRepository;
import org.comixedproject.repositories.users.ComiXedUserRepository;
import org.hibernate.exception.ConstraintViolationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Log4j2
public class UserService {
  static final String IMPORT_ROOT_DIRECTORY = "preference.import.root-directory";

  @Autowired private ComiXedUserRepository userRepository;
  @Autowired private ComiXedRoleRepository roleRepository;
  @Autowired private GenericUtilitiesAdaptor genericUtilitiesAdaptor;
  @Autowired private PublishCurrentUserAction publishCurrentUserAction;

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
    String value = propertyValue;
    if (propertyName.equals(IMPORT_ROOT_DIRECTORY)) {
      log.trace("Normalizing import root directory");
      value = FilenameUtils.normalize(propertyValue);
    }
    log.debug("Setting user property: email={} property[{}]={}", email, propertyName, value);

    final ComiXedUser user = this.userRepository.findByEmail(email);

    if (user == null) throw new ComiXedUserException("Invalid user: " + email);
    user.setProperty(propertyName, value);

    final ComiXedUser result = this.userRepository.save(user);
    this.doPublishUserUpdate(result);
    return result;
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
    final ComiXedUser result = this.userRepository.save(user);
    this.doPublishUserUpdate(result);
    return result;
  }

  private void doPublishUserUpdate(final ComiXedUser user) {
    try {
      this.publishCurrentUserAction.publish(user);
    } catch (PublishingException error) {
      log.error("Failed to publish user update", error);
    }
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

  /**
   * Updates the specified user account with the given values. If the password is null then it is
   * not updated.
   *
   * @param id the user record id
   * @param email the email
   * @param password the password
   * @return the updated user
   * @throws ComiXedUserException if an error occurs
   */
  @Transactional
  public ComiXedUser updateCurrentUser(final long id, final String email, String password)
      throws ComiXedUserException {
    log.debug("Loading user: id={}", id);
    final ComiXedUser user = this.doGetById(id);

    if (password != null) {
      password = StringUtils.trim(password);
    }

    log.trace("Updating user details");
    user.setEmail(email);
    if (StringUtils.isNotEmpty(password)) {
      user.setPasswordHash(this.genericUtilitiesAdaptor.createHash(password.getBytes()));
    }

    log.trace("Saving updated user");
    try {
      final ComiXedUser result = this.userRepository.save(user);
      this.doPublishUserUpdate(result);
      return result;
    } catch (ConstraintViolationException error) {
      throw new ComiXedUserException("Failed to save user", error);
    }
  }

  private ComiXedUser doGetById(final long id) throws ComiXedUserException {
    final ComiXedUser result = this.userRepository.getById(id);
    if (result == null) throw new ComiXedUserException("No such user: id=" + id);
    return result;
  }

  /**
   * Checks if there are existing user accounts.
   *
   * @return <code>true</code> if there are existing accounts
   */
  public boolean hasAdminAccounts() {
    log.debug("Checking if there are existing accounts");
    return !this.userRepository.findAll().stream()
        .filter(ComiXedUser::isAdmin)
        .collect(Collectors.toList())
        .isEmpty();
  }

  /**
   * Creates the initial admin account.
   *
   * @param email
   * @param password
   * @throws ComiXedUserException if an admin account already exists, or the email is already used
   *     by an account
   */
  @Transactional
  public void createAdminAccount(final String email, final String password)
      throws ComiXedUserException {
    log.trace("Checking for existing admin accounts");
    if (this.hasAdminAccounts()) {
      throw new ComiXedUserException(
          "Cannot create initial admin account: admin accounts already exist");
    }
    log.trace("Checking for existing account for {}", email);
    if (this.userRepository.findByEmail(email) != null)
      throw new ComiXedUserException("Email already in use: " + email);

    log.debug("Creating initial admin account: {}", email);
    final ComiXedUser user = new ComiXedUser();
    user.setEmail(email);
    user.setPasswordHash(this.genericUtilitiesAdaptor.createHash(password.getBytes()));
    user.getRoles().add(this.roleRepository.findByName(ADMIN_ROLE));
    user.getRoles().add(this.roleRepository.findByName(READER_ROLE));
    log.debug("Saving new user account: {}", user);
    this.userRepository.save(user);
  }
}
