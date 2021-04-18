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

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.stereotype.Component;

/**
 * <code>CsvAdaptor</code> provides an adaptor for generating CSV files.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class CsvAdaptor {
  /**
   * Takes a list of records and converts them into a CSV file.
   *
   * @param records the records
   * @param handler the row handler
   * @param <T> the value type for each row
   * @return the CSV data
   * @throws IOException if an error occurs
   */
  public <T> byte[] encodeRecords(List<T> records, CsvRowHandler<T> handler) throws IOException {
    final ByteArrayOutputStream result = new ByteArrayOutputStream();
    final OutputStreamWriter output = new OutputStreamWriter(result);
    final CSVPrinter printer =
        new CSVPrinter(output, CSVFormat.DEFAULT.withHeader(handler.createRow(0, null)));
    for (int index = 0; index < records.size(); index++) {
      printer.printRecord(handler.createRow(index + 1, records.get(index)));
    }
    printer.flush();
    printer.close();
    return result.toByteArray();
  }
}
