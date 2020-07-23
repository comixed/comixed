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

public class MatcherTest {

  private static final String TYPE = "ComicBookPublisherMatcher";
  private static final String OPERATOR = "1";
  private static final boolean NOT = false;
  private static final String MODE = "Or";
  private static final String VALUE = "Dark Horse";

  private Matcher matcher;

  @Before
  public void setUp() {
    matcher = new Matcher();
    matcher.setType(TYPE);
    matcher.setOperator(OPERATOR);
    matcher.setNot(NOT);
    matcher.setMode(MODE);
    matcher.setValue(VALUE);
  }

  @Test
  public void testHasType() {
    assertEquals(TYPE, matcher.getType());
  }

  @Test
  public void testCanUpdateType() {
    String newName = "ComicBookSeriesMatcher";
    matcher.setType(newName);
    assertEquals(newName, matcher.getType());
  }

  @Test
  public void testHasOperator() {
    assertEquals(OPERATOR, matcher.getOperator());
  }

  @Test
  public void testCanUpdateOperator() {
    String newOperator = "2";
    matcher.setOperator(newOperator);
    assertEquals(newOperator, matcher.getOperator());
  }

  @Test
  public void testHasNot() {
    assertEquals(NOT, matcher.isNot());
  }

  @Test
  public void testCanUpdateNot() {
    matcher.setNot(true);
    assertEquals(true, matcher.isNot());
  }

  @Test
  public void testHasMode() {
    assertEquals(MODE, matcher.getMode());
  }

  @Test
  public void testCanUpdateMode() {
    String newMode = "";
    matcher.setMode(newMode);
    assertEquals(newMode, matcher.getMode());
  }

  @Test
  public void testHasValue() {
    assertEquals(VALUE, matcher.getValue());
  }

  @Test
  public void testCanUpdateValue() {
    String newValue = "new value";
    matcher.setValue(newValue);
    assertEquals(newValue, matcher.getValue());
  }
}
