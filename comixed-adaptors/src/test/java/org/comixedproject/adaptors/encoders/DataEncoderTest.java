/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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

package org.comixedproject.adaptors.encoders;

import static junit.framework.TestCase.assertNotNull;
import static org.junit.Assert.assertArrayEquals;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class DataEncoderTest {
  private static final byte[] TEST_CONTENT =
      "This is some content that I want to encode".getBytes();

  @InjectMocks private DataEncoder encoder;

  @Test
  public void testEncodeAndDecode() {
    final String encoded = encoder.encode(TEST_CONTENT);

    assertNotNull(encoded);

    final byte[] decoded = encoder.decode(encoded);

    assertNotNull(decoded);
    assertArrayEquals(TEST_CONTENT, decoded);
  }
}
