/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

package org.comixedproject.model.opds;

/**
 * <code>OPDSAuthor</code> provides authors of a OPDS entry.
 *
 * @author João França
 * @author Darryl L. Pierce
 */
public class OPDSBookmark {
  private long docId;

  private String mark;

  private boolean isFinished;

  public OPDSBookmark(long docId, String mark, Boolean isFinished) {
    this.docId = docId;
    this.mark = mark;
    this.isFinished = isFinished;
  }

  public long getDocId() {
    return this.docId;
  }

  public String getMark() {
    return this.mark;
  }

  public Boolean getIsFinished() {
    return this.isFinished;
  }
}
