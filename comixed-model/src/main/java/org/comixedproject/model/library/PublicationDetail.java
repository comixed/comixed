/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2025, The ComiXed Project
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

package org.comixedproject.model.library;

import java.util.Date;

/**
 * <code>PublicationDetail</code> provides the publication details for a comic book.
 *
 * @author Darryl L. Pierce
 */
public interface PublicationDetail {
  String getPublisher();

  String getImprint();

  String getSeries();

  String getVolume();

  String getIssueNumber();

  Date getCoverDate();

  Date getStoreDate();

  String getTitle();
}
