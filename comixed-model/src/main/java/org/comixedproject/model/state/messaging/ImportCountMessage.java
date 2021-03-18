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

package org.comixedproject.model.state.messaging;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Objects;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * <code>ImportCountMessage</code> is the message that's sent to the import count queue.
 *
 * @author Darryl L. Pierce
 */
@AllArgsConstructor
public class ImportCountMessage {
  @JsonProperty("addCount")
  @Getter
  private long addCount;

  @JsonProperty("processingCount")
  @Getter
  private long processingCount;

  @Override
  public boolean equals(final Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    final ImportCountMessage that = (ImportCountMessage) o;
    return addCount == that.addCount && processingCount == that.processingCount;
  }

  @Override
  public int hashCode() {
    return Objects.hash(addCount, processingCount);
  }
}
