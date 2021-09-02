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

package org.comixedproject.state.lists;

import org.comixedproject.model.lists.ReadingListState;
import org.springframework.messaging.Message;
import org.springframework.statemachine.state.State;

/**
 * <code>ReadingListStateChangeListener</code> defines a type that receives notification when a
 * reading list's state has changed.
 *
 * @author Darryl L. Pierce
 */
public interface ReadingListStateChangeListener {
  /**
   * Invoked when a state change occurs.
   *
   * @param state the state
   * @param message the event message
   */
  void onReadingListStateChange(
      State<ReadingListState, ReadingListEvent> state, Message<ReadingListEvent> message);
}
