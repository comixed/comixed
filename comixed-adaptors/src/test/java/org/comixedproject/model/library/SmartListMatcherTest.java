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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

package org.comixedproject.model.library;

import static org.junit.Assert.assertEquals;

import org.junit.Before;
import org.junit.Test;

public class SmartListMatcherTest {

  private static final String TYPE = "ComicBookPublisherMatcher";
  private static final String OPERATOR = "1";
  private static final boolean NOT = false;
  private static final String MODE = "Or";
  private static final String VALUE = "Dark Horse";

  private SmartListMatcher smartListMatcher;

  @Before
  public void setUp() {
    smartListMatcher = new SmartListMatcher();
    smartListMatcher.setType(TYPE);
    smartListMatcher.setOperator(OPERATOR);
    smartListMatcher.setNot(NOT);
    smartListMatcher.setMode(MODE);
    smartListMatcher.setValue(VALUE);
  }

  @Test
  public void testHasType() {
    assertEquals(TYPE, smartListMatcher.getType());
  }

  @Test
  public void testCanUpdateType() {
    String newName = "ComicBookSeriesMatcher";
    smartListMatcher.setType(newName);
    assertEquals(newName, smartListMatcher.getType());
  }

  @Test
  public void testHasOperator() {
    assertEquals(OPERATOR, smartListMatcher.getOperator());
  }

  @Test
  public void testCanUpdateOperator() {
    String newOperator = "2";
    smartListMatcher.setOperator(newOperator);
    assertEquals(newOperator, smartListMatcher.getOperator());
  }

  @Test
  public void testHasNot() {
    assertEquals(NOT, smartListMatcher.isNot());
  }

  @Test
  public void testCanUpdateNot() {
    smartListMatcher.setNot(true);
    assertEquals(true, smartListMatcher.isNot());
  }

  @Test
  public void testHasMode() {
    assertEquals(MODE, smartListMatcher.getMode());
  }

  @Test
  public void testCanUpdateMode() {
    String newMode = "";
    smartListMatcher.setMode(newMode);
    assertEquals(newMode, smartListMatcher.getMode());
  }

  @Test
  public void testHasValue() {
    assertEquals(VALUE, smartListMatcher.getValue());
  }

  @Test
  public void testCanUpdateValue() {
    String newValue = "new value";
    smartListMatcher.setValue(newValue);
    assertEquals(newValue, smartListMatcher.getValue());
  }
}
