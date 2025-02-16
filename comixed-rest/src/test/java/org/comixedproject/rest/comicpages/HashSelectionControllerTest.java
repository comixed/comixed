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

import static org.junit.Assert.*;

import jakarta.servlet.http.HttpSession;
import java.util.List;
import java.util.Set;
import org.comixedproject.service.comicpages.ComicPageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class HashSelectionControllerTest {
  private static final String TEST_HASH = "The Hash Value";

  @InjectMocks private HashSelectionController controller;
  @Mock private ComicPageService comicPageService;
  @Mock private SelectedHashManager selectedHashManager;
  @Mock private HttpSession session;
  @Mock private Set<String> selectedHashList;
  @Mock private List<String> duplicateHashList;

  @BeforeEach
  void setUp() {
    Mockito.when(selectedHashManager.load(Mockito.any(HttpSession.class)))
        .thenReturn(selectedHashList);
    Mockito.when(comicPageService.getAllDuplicateHashes()).thenReturn(duplicateHashList);
  }

  @Test
  void loadHashSelections() {
    final Set<String> result = controller.loadHashSelections(session);

    assertSame(selectedHashList, result);

    Mockito.verify(selectedHashManager).load(session);
  }

  @Test
  void addAllDuplicateHashes() {
    final Set<String> result = controller.addAllDuplicateHashes(session);

    assertSame(selectedHashList, result);

    Mockito.verify(selectedHashManager).merge(session, duplicateHashList);
  }

  @Test
  void addSelectedHash() {
    final Set<String> result = controller.addHashSelection(session, TEST_HASH);

    assertNotNull(result);
    assertSame(selectedHashList, result);

    Mockito.verify(selectedHashManager, Mockito.times(1)).load(session);
    Mockito.verify(selectedHashList, Mockito.times(1)).add(TEST_HASH);
    Mockito.verify(selectedHashManager, Mockito.times(1)).save(session, selectedHashList);
  }

  @Test
  void removeSelectedHash() {
    final Set<String> result = controller.removeHashSelection(session, TEST_HASH);

    assertNotNull(result);
    assertSame(selectedHashList, result);

    Mockito.verify(selectedHashManager, Mockito.times(1)).load(session);
    Mockito.verify(selectedHashList, Mockito.times(1)).remove(TEST_HASH);
    Mockito.verify(selectedHashManager, Mockito.times(1)).save(session, selectedHashList);
  }

  @Test
  void clearHashSelections() {
    controller.clearHashSelections(session);

    Mockito.verify(selectedHashManager, Mockito.times(1)).clearSelections(session);
  }
}
