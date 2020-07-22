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

import java.util.List;
import java.util.Optional;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.model.user.Role;
import org.comixedproject.repositories.ComiXedUserRepository;
import org.comixedproject.repositories.RoleRepository;
import org.comixedproject.utils.Utils;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Log4j2
public class UserService implements InitializingBean {
  @Autowired private ComiXedUserRepository userRepository;
  @Autowired private RoleRepository roleRepository;
  @Autowired private Utils utils;

  private Role readerRole;
  private Role adminRole;

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

  public void delete(long id) throws ComiXedUserException {
    log.debug("Deleting user: id={}", id);

    final Optional<ComiXedUser> record = this.userRepository.findById(id);

    if (!record.isPresent()) {
      throw new ComiXedUserException("No such user: id=" + id);
    }

    log.debug("Deleting user record");
    this.userRepository.delete(record.get());
  }

  public ComiXedUser save(final ComiXedUser user) throws ComiXedUserException {
    log.debug("{} user: email={}", user.getId() != null ? "Updating" : "Saving", user.getEmail());

    try {
      return this.userRepository.save(user);
    } catch (RuntimeException error) {
      throw new ComiXedUserException("Unable to save user: " + user.getEmail(), error);
    }
  }

  public List<ComiXedUser> findAll() {
    log.debug("Getting all users");

    final List<ComiXedUser> result = this.userRepository.findAll();

    log.debug("Returning {} records", result.size());

    return result;
  }

  public ComiXedUser findById(final long id) throws ComiXedUserException {
    log.debug("Finding user: id={}", id);

    final Optional<ComiXedUser> record = this.userRepository.findById(id);

    if (!record.isPresent()) {
      throw new ComiXedUserException("No such user: id=" + id);
    }

    return record.get();
  }

  public Role findRoleByName(final String name) throws ComiXedUserException {
    log.debug("Finding role: name={}", name);

    final Role record = this.roleRepository.findByName(name);

    if (record == null) {
      log.debug("No such role exists");
      throw new ComiXedUserException("Invalid role: name=" + name);
    }

    return record;
  }

  public ComiXedUser setUserProperty(
      final String email, final String propertyName, final String propertyValue)
      throws ComiXedUserException {
    log.debug(
        "Setting user property: email={} property[{}]={}", email, propertyName, propertyValue);

    final ComiXedUser user = this.userRepository.findByEmail(email);

    user.setProperty(propertyName, propertyValue);

    return this.userRepository.save(user);
  }

  public ComiXedUser setUserPassword(final String email, final String password)
      throws ComiXedUserException {
    log.debug("Updating password for user: email={} length={}", email, password.length());

    final ComiXedUser record = this.userRepository.findByEmail(email);

    if (record == null) {
      throw new ComiXedUserException("No such user: email=" + email);
    }

    record.setPasswordHash(this.utils.createHash(password.getBytes()));

    return this.userRepository.save(record);
  }

  public ComiXedUser setUserEmail(final String currentEmail, final String newEmail)
      throws ComiXedUserException {
    log.debug("Setting user email: old={} new={}", currentEmail, newEmail);

    final ComiXedUser record = this.userRepository.findByEmail(currentEmail);

    if (record == null) {
      throw new ComiXedUserException("NO such user: email=" + currentEmail);
    }

    record.setEmail(newEmail);

    return this.userRepository.save(record);
  }

  @Transactional
  public ComiXedUser deleteUserProperty(final String email, final String property) {
    log.debug("Deleting user property: email={} property={}", email, property);
    final ComiXedUser user = this.userRepository.findByEmail(email);
    user.deleteProperty(property);
    return this.userRepository.save(user);
  }

  @Transactional
  public ComiXedUser createUser(final String email, final String password, final boolean isAdmin)
      throws ComiXedUserException {
    log.debug("Creating new user: email={}", email);

    ComiXedUser user = this.userRepository.findByEmail(email);

    if (user != null) {
      throw new ComiXedUserException("user already exists: email=" + email);
    }

    user = new ComiXedUser();
    user.setEmail(email);
    user.setPasswordHash(this.utils.createHash(password.getBytes()));
    user.addRole(this.readerRole);
    if (isAdmin) {
      user.addRole(this.adminRole);
    }

    log.debug("Saving new user");

    return this.userRepository.save(user);
  }

  @Override
  public void afterPropertiesSet() throws Exception {
    try {
      this.readerRole = this.findRoleByName("READER");
      this.adminRole = this.findRoleByName("ADMIN");
    } catch (ComiXedUserException error) {
      error.printStackTrace();
    }
  }
}
