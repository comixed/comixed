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

package org.comixedproject.messaging.model;

import java.security.Principal;
import javax.security.auth.Subject;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * <code>StompPrincipal</code> provides an instance of {@link Principal} for use in messaging.
 *
 * @author Darryl L. Pierce
 */
@AllArgsConstructor
public class StompPrincipal implements Principal {
  @Getter private String name;

  @Override
  public boolean implies(final Subject subject) {
    return subject.getPrincipals().stream()
        .anyMatch(principal -> this.name.equals(principal.getName()));
  }
}
