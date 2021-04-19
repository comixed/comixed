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

package org.comixedproject.adaptors.csv;

import java.io.*;
import java.util.ArrayList;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.apache.commons.csv.CSVRecord;
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
  public <T> byte[] encodeRecords(List<T> records, CsvRowEncoder<T> handler) throws IOException {
    final var result = new ByteArrayOutputStream();
    final var output = new OutputStreamWriter(result);
    final var printer =
        new CSVPrinter(output, CSVFormat.DEFAULT.withHeader(handler.createRow(0, null)));

    for (var index = 0; index < records.size(); index++) {
      printer.printRecord(handler.createRow(index + 1, records.get(index)));
    }
    printer.flush();
    printer.close();
    return result.toByteArray();
  }

  public void decodeRecords(
      final InputStream inputStream, final String[] header, CsvRowDecoder handler)
      throws IOException {
    final List<CSVRecord> records =
        CSVFormat.DEFAULT.withHeader(header).parse(new InputStreamReader(inputStream)).getRecords();

    for (var index = 0; index < records.size(); index++) {
      log.info("Processing row: index={}", index);
      final CSVRecord row = records.get(index);
      List<String> values = new ArrayList<>();
      for (var which = 0; which < row.size(); which++) values.add(row.get(which));
      handler.processRow(index, values);
    }
  }
}
