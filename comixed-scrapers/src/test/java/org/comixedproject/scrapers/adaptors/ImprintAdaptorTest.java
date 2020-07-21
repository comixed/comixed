/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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

package org.comixedproject.scrapers.adaptors;

import org.comixedproject.model.comic.Comic;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class ImprintAdaptorTest {
  private static final String TEST_PUBLISHER = "Marvel";
  private static final String TEST_IMPRINT = "Marvel Soleil";

  @InjectMocks private ImprintAdaptor imprintAdaptor;
  @Mock private Comic comic;

  @Test
  public void testComicWithImprint() {
    Mockito.when(comic.getPublisher()).thenReturn(TEST_IMPRINT);

    imprintAdaptor.update(comic);

    Mockito.verify(comic, Mockito.times(1)).setImprint(TEST_IMPRINT);
    Mockito.verify(comic, Mockito.times(1)).setPublisher(TEST_PUBLISHER);
  }

  @Test
  public void testComicWithoutImprint() {
    Mockito.when(comic.getPublisher()).thenReturn(TEST_PUBLISHER);

    imprintAdaptor.update(comic);

    Mockito.verify(comic, Mockito.times(1)).setImprint("");
    Mockito.verify(comic, Mockito.never()).setPublisher(Mockito.anyString());
  }
}
