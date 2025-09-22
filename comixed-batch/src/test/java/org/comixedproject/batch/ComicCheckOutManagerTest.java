/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2025, The ComiXed Project
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

package org.comixedproject.batch;

import static org.awaitility.Awaitility.await;
import static org.junit.jupiter.api.Assertions.*;

import java.util.concurrent.TimeUnit;
import net.jodah.concurrentunit.Waiter;
import org.comixedproject.service.admin.ConfigurationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ComicCheckOutManagerTest {
  private static final long TEST_COMIC_BOOK_ID = 717L;

  @InjectMocks private ComicCheckOutManager manager;
  @Mock private ConfigurationService configurationService;

  @Test
  void checkOut_featureDisabled() {
    Mockito.when(
            configurationService.isFeatureEnabled(ConfigurationService.CFG_EXCLUSIVE_COMIC_LOCK))
        .thenReturn(false);

    manager.checkOut(TEST_COMIC_BOOK_ID);

    assertFalse(manager.catalog.contains(TEST_COMIC_BOOK_ID));
  }

  @Test
  void checkOut() {
    Mockito.when(
            configurationService.isFeatureEnabled(ConfigurationService.CFG_EXCLUSIVE_COMIC_LOCK))
        .thenReturn(true);

    manager.checkOut(TEST_COMIC_BOOK_ID);

    assertTrue(manager.catalog.contains(TEST_COMIC_BOOK_ID));
  }

  @Test
  void checkOut_alreadyClaimed() {
    final Waiter waiter = new Waiter();

    Mockito.when(
            configurationService.isFeatureEnabled(ConfigurationService.CFG_EXCLUSIVE_COMIC_LOCK))
        .thenReturn(true);

    manager.checkOut(TEST_COMIC_BOOK_ID);

    new Thread(
            () -> {
              manager.checkOut(TEST_COMIC_BOOK_ID);
              manager.checkIn(TEST_COMIC_BOOK_ID);
              waiter.assertTrue(true);
            })
        .start();

    await().atMost(3, TimeUnit.SECONDS);
    manager.checkIn(TEST_COMIC_BOOK_ID);
    waiter.resume();
    assertFalse(manager.catalog.contains(TEST_COMIC_BOOK_ID));
  }
}
