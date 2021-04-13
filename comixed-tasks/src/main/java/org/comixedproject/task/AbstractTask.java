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

package org.comixedproject.task;

/**
 * <code>AbstractTask</code> provides a foundation for creating new {@link Task} types.
 *
 * @author Darryl L. Pierce
 */
public abstract class AbstractTask implements Task {
  private String description;

  protected AbstractTask() {}

  @Override
  public String getDescription() {
    if (this.description == null) {
      this.description = this.createDescription();
    }

    return this.description;
  }

  /**
   * Must be overridden by child classes to provide a description.
   *
   * @return the description
   */
  protected abstract String createDescription();

  @Override
  public void afterExecution() {}
}
