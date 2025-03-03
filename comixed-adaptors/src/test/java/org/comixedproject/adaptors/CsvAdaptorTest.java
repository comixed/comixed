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

import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import org.apache.commons.lang.RandomStringUtils;
import org.comixedproject.adaptors.csv.CsvAdaptor;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CsvAdaptorTest {
  @InjectMocks private CsvAdaptor adaptor;
  private List<String> records = new ArrayList<>();

  @BeforeEach
  void setUp() {
    for (int index = 0; index < 25; index++) {
      records.add(RandomStringUtils.random(32, true, true));
    }
  }

  @Test
  void encodeRecords() throws IOException {
    final byte[] result =
        adaptor.encodeRecords(
            records,
            (index, model) -> {
              if (index == 0) {
                return new String[] {"HEADER"};
              } else {
                return new String[] {model};
              }
            });

    assertNotNull(result);
  }
}
