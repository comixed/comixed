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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

package org.comixed.service.user;

import org.comixed.model.user.ComiXedUser;
import org.comixed.model.user.Role;
import org.comixed.repositories.ComiXedUserRepository;
import org.comixed.repositories.RoleRepository;
import org.comixed.utils.Utils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired private ComiXedUserRepository userRepository;
    @Autowired private RoleRepository roleRepository;
    @Autowired private Utils utils;

    public ComiXedUser findByEmail(String email)
            throws
            ComiXedUserException {
        this.logger.info("Finding user by email: {}",
                         email);

        final ComiXedUser result = this.userRepository.findByEmail(email);

        if (result == null) {
            this.logger.warn("No such user: {}",
                             email);
            throw new ComiXedUserException("No such user: " + email);
        }

        this.logger.debug("Found user: id={}",
                          result.getId());

        return result;
    }

    public void delete(long id)
            throws
            ComiXedUserException {
        this.logger.info("Deleting user: id={}",
                         id);

        final Optional<ComiXedUser> record = this.userRepository.findById(id);

        if (!record.isPresent()) {
            throw new ComiXedUserException("No such user: id=" + id);
        }

        this.logger.debug("Deleting user record");
        this.userRepository.delete(record.get());
    }

    public ComiXedUser save(final ComiXedUser user)
            throws
            ComiXedUserException {
        this.logger.info("{} user: email={}",
                         user.getId() != null
                         ? "Updating"
                         : "Saving",
                         user.getEmail());

        try {
            return this.userRepository.save(user);
        }
        catch (RuntimeException error) {
            throw new ComiXedUserException("Unable to save user: " + user.getEmail(),
                                           error);
        }
    }

    public List<ComiXedUser> findAll() {
        this.logger.info("Getting all users");

        final List<ComiXedUser> result = this.userRepository.findAll();

        this.logger.debug("Returning {} records",
                          result.size());

        return result;
    }

    public ComiXedUser findById(final long id)
            throws
            ComiXedUserException {
        this.logger.info("Finding user: id={}",
                         id);

        final Optional<ComiXedUser> record = this.userRepository.findById(id);

        if (!record.isPresent()) {
            throw new ComiXedUserException("No such user: id=" + id);
        }

        return record.get();
    }

    public Role findRoleByName(final String name)
            throws
            ComiXedUserException {
        this.logger.info("Finding role: name={}",
                         name);

        final Role record = this.roleRepository.findByName(name);

        if (record == null) {
            this.logger.info("No such role exists");
            throw new ComiXedUserException("Invalid role: name=" + name);
        }

        return record;
    }

    public ComiXedUser setUserProperty(final String email,
                                       final String propertyName,
                                       final String propertyValue)
            throws
            ComiXedUserException {
        this.logger.info("Setting user property: email={} property[{}]={}",
                         email,
                         propertyName,
                         propertyValue);

        final ComiXedUser user = this.userRepository.findByEmail(email);

        user.setProperty(propertyName,
                         propertyValue);

        return this.userRepository.save(user);
    }

    public ComiXedUser setUserPassword(final String email,
                                       final String password)
            throws
            ComiXedUserException {
        this.logger.info("Updating password for user: email={} length={}",
                         email,
                         password.length());

        final ComiXedUser record = this.userRepository.findByEmail(email);

        if (record == null) {
            throw new ComiXedUserException("No such user: email=" + email);
        }

        record.setPasswordHash(this.utils.createHash(password.getBytes()));

        return this.userRepository.save(record);
    }

    public ComiXedUser setUserEmail(final String currentEmail,
                                    final String newEmail)
            throws
            ComiXedUserException {
        this.logger.info("Setting user email: old={} new={}",
                         currentEmail,
                         newEmail);

        final ComiXedUser record = this.userRepository.findByEmail(currentEmail);

        if (record == null) {
            throw new ComiXedUserException("NO such user: email=" + currentEmail);
        }

        record.setEmail(newEmail);

        return this.userRepository.save(record);
    }

    @Transactional
    public ComiXedUser deleteUserProperty(final String email,
                                          final String property) {
        this.logger.debug("Deleting user property: email={} property={}",
                          email,
                          property);
        final ComiXedUser user = this.userRepository.findByEmail(email);
        user.deleteProperty(property);
        return this.userRepository.save(user);
    }
}
