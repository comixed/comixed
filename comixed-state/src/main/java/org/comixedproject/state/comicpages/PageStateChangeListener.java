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

package org.comixedproject.state.comicpages;

import org.comixedproject.model.comicpages.Page;
import org.comixedproject.model.comicpages.PageState;
import org.springframework.messaging.Message;
import org.springframework.statemachine.state.State;

/**
 * <code>PageStateChangeListener</code> defines a type that is notified of state changes for a
 * {@link Page}.
 *
 * @author Darryl L. Pierce
 */
public interface PageStateChangeListener {
  /**
   * Invokes with the details of a state change.
   *
   * @param state the new state
   * @param message the event message
   */
  void onPageStateChange(State<PageState, PageEvent> state, Message<PageEvent> message);
}
