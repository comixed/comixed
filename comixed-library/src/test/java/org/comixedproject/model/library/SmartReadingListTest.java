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

import org.comixedproject.model.user.ComiXedUser;
import org.junit.Before;
import org.junit.Test;

public class SmartReadingListTest {

  private static final String NAME = "Dark Horse";
  private static final String SUMMARY = "Filters by publisher";
  private static final boolean NOT = false;
  private static final String MODE = "Or";

  private SmartReadingList smartReadingList;

  @Before
  public void setUp() {
    ComiXedUser user = new ComiXedUser();
    smartReadingList = new SmartReadingList();
    smartReadingList.setOwner(user);
    smartReadingList.setName(NAME);
    smartReadingList.setSummary(SUMMARY);
    smartReadingList.setNot(NOT);
    smartReadingList.setMode(MODE);
  }

  @Test
  public void testHasName() {
    assertEquals(NAME, smartReadingList.getName());
  }

  @Test
  public void testCanUpdateName() {
    String newName = "Image";
    smartReadingList.setName(newName);
    assertEquals(newName, smartReadingList.getName());
  }

  @Test
  public void testHasSummary() {
    assertEquals(SUMMARY, smartReadingList.getSummary());
  }

  @Test
  public void testCanUpdateSummary() {
    String newSummary = "New summary";
    smartReadingList.setSummary(newSummary);
    assertEquals(newSummary, smartReadingList.getSummary());
  }

  @Test
  public void testHasNot() {
    assertEquals(NOT, smartReadingList.isNot());
  }

  @Test
  public void testCanUpdateNot() {
    smartReadingList.setNot(true);
    assertEquals(true, smartReadingList.isNot());
  }

  @Test
  public void testHasMode() {
    assertEquals(MODE, smartReadingList.getMode());
  }

  @Test
  public void testCanUpdateMode() {
    String newMode = "";
    smartReadingList.setMode(newMode);
    assertEquals(newMode, smartReadingList.getMode());
  }
}
