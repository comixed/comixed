/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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

package org.comixedproject.state;

import org.comixedproject.model.state.StatefulItem;

/**
 * <code>StateTransitionGuard</code> defines a type that decides whether a state transition can
 * occurs.
 *
 * @param <T> the input type
 * @author Darryl L. Pierce
 */
public interface StateTransitionGuard<T extends StatefulItem<?>> {
  /**
   * Decides if the transition can occur.
   *
   * @param input the input value
   * @return true if it can occur
   */
  boolean evaluate(T input);
}
