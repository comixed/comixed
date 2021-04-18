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

package org.comixedproject.adaptors;

/**
 * <code>CsvRowHandler</code> defines a type that processes a single row of data for a CSV file
 * being created.
 *
 * @param <T> the type for each row
 */
@FunctionalInterface
public interface CsvRowHandler<T> {
  /**
   * Takes a row from the data model and returns a row for generated document.
   *
   * <p>When the index is 0 then the return value is expected to be the set of headers.
   *
   * @param index the row index
   * @param model the row model
   * @return the CSV data
   */
  String[] createRow(int index, T model);
}
