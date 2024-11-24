/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2024, The ComiXed Project
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

package org.comixedproject.rest.comicpages;

import static org.comixedproject.rest.comicpages.SelectedHashManager.HASH_SELECTIONS;
import static org.junit.Assert.*;

import jakarta.servlet.http.HttpSession;
import java.util.List;
import java.util.Set;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class SelectedHashManagerTest {
  @InjectMocks private SelectedHashManager manager;
  @Mock private HttpSession session;
  @Mock private Set<String> selectionSet;
  @Mock private List<String> additionalSelectionList;

  @Captor private ArgumentCaptor<Set<String>> selectionSetArgumentCaptor;

  @Before
  public void setUp() {
    Mockito.when(session.getAttribute(HASH_SELECTIONS)).thenReturn(selectionSet);
  }

  @Test
  public void testLoad_noSelectionsFound() {
    Mockito.when(session.getAttribute(HASH_SELECTIONS)).thenReturn(null);

    final Set<String> result = manager.load(session);

    assertNotNull(result);

    Mockito.verify(session, Mockito.times(1)).getAttribute(HASH_SELECTIONS);
    Mockito.verify(session, Mockito.times(1)).setAttribute(HASH_SELECTIONS, result);
  }

  @Test
  public void testLoad() {
    final Set<String> result = manager.load(session);

    assertNotNull(result);

    Mockito.verify(session, Mockito.times(1)).getAttribute(HASH_SELECTIONS);
    Mockito.verify(session, Mockito.never()).setAttribute(Mockito.anyString(), Mockito.any());
  }

  @Test
  public void testSave() {
    manager.save(session, selectionSet);

    Mockito.verify(session, Mockito.times(1)).setAttribute(HASH_SELECTIONS, selectionSet);
  }

  @Test
  public void testMerge() {
    manager.merge(session, additionalSelectionList);

    Mockito.verify(session, Mockito.times(1)).getAttribute(HASH_SELECTIONS);
    Mockito.verify(selectionSet, Mockito.times(1)).addAll(additionalSelectionList);
    Mockito.verify(session, Mockito.times(1)).setAttribute(HASH_SELECTIONS, selectionSet);
  }

  @Test
  public void testClear() {
    Mockito.doNothing()
        .when(session)
        .setAttribute(Mockito.anyString(), selectionSetArgumentCaptor.capture());

    manager.clearSelections(session);

    final Set<String> selections = selectionSetArgumentCaptor.getValue();
    assertNotNull(selections);
    assertTrue(selections.isEmpty());

    Mockito.verify(session, Mockito.times(1)).setAttribute(HASH_SELECTIONS, selections);
  }
}
