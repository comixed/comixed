/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project
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

package org.comixed.scrapers.comicvine;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.comixed.model.comic.Comic;
import org.comixed.repositories.comic.PublisherRepository;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit4.SpringRunner;

@RunWith(SpringRunner.class)
@SpringBootTest(
    classes = {
      ComicVinePublisherDetailsResponseProcessor.class,
      ComicVineResponseAdaptor.class,
      ObjectMapper.class
    })
public class ComicVinePublisherDetailsResponseProcessorTest {
  private static final byte[] BAD_DATA = "This is not a valid response".getBytes();
  private static final byte[] GOOD_DATA =
      "{\"error\":\"OK\",\"limit\":1,\"offset\":0,\"number_of_page_results\":1,\"number_of_total_results\":1,\"status_code\":1,\"results\":{\"deck\":\"Originally known as \\\"National Publications\\\", DC is a publisher of comic books featuring iconic characters and teams such as Superman, Batman, Wonder Woman, Green Lantern, the Justice League of America, and the Teen Titans, and is considered the originator of the American superhero genre. DC, along with rival Marvel Comics, is one of the \\\"big two\\\" American comic book publishers. DC Entertainment is a subsidiary of Warner Brothers and its parent company Time Warner.\",\"id\":10,\"image\":{\"icon_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/square_avatar\\/0\\/40\\/5213245-dc_logo_blue_final.jpg\",\"medium_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/scale_medium\\/0\\/40\\/5213245-dc_logo_blue_final.jpg\",\"screen_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/screen_medium\\/0\\/40\\/5213245-dc_logo_blue_final.jpg\",\"screen_large_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/screen_kubrick\\/0\\/40\\/5213245-dc_logo_blue_final.jpg\",\"small_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/scale_small\\/0\\/40\\/5213245-dc_logo_blue_final.jpg\",\"super_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/scale_large\\/0\\/40\\/5213245-dc_logo_blue_final.jpg\",\"thumb_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/scale_avatar\\/0\\/40\\/5213245-dc_logo_blue_final.jpg\",\"tiny_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/square_mini\\/0\\/40\\/5213245-dc_logo_blue_final.jpg\",\"original_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/original\\/0\\/40\\/5213245-dc_logo_blue_final.jpg\",\"image_tags\":\"All Images,DC Comics logo\"},\"name\":\"DC Comics\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/dc-comics\\/4010-10\\/\"},\"version\":\"1.0\"}"
          .getBytes();
  private static final byte[] IMPRINT_DATA =
      "{\"error\":\"OK\",\"limit\":1,\"offset\":0,\"number_of_page_results\":1,\"number_of_total_results\":1,\"status_code\":1,\"results\":{\"deck\":\"Vertigo is an imprint of  DC Comics suggested for mature readers and is a continuity separate from the DC Universe that has included Sandman, Swamp Thing, John Constantine (Hellblazer) and many others. However, nowadays the imprint is mostly focused upon creator-owned material.\",\"id\":521,\"image\":{\"icon_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/square_avatar\\/6\\/67663\\/4717683-logo.jpg\",\"medium_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/scale_medium\\/6\\/67663\\/4717683-logo.jpg\",\"screen_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/screen_medium\\/6\\/67663\\/4717683-logo.jpg\",\"screen_large_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/screen_kubrick\\/6\\/67663\\/4717683-logo.jpg\",\"small_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/scale_small\\/6\\/67663\\/4717683-logo.jpg\",\"super_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/scale_large\\/6\\/67663\\/4717683-logo.jpg\",\"thumb_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/scale_avatar\\/6\\/67663\\/4717683-logo.jpg\",\"tiny_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/square_mini\\/6\\/67663\\/4717683-logo.jpg\",\"original_url\":\"https:\\/\\/comicvine1.cbsistatic.com\\/uploads\\/original\\/6\\/67663\\/4717683-logo.jpg\",\"image_tags\":\"All Images\"},\"name\":\"Vertigo\",\"site_detail_url\":\"https:\\/\\/comicvine.gamespot.com\\/vertigo\\/4010-521\\/\"},\"version\":\"1.0\"}"
          .getBytes();

  @Autowired private ComicVinePublisherDetailsResponseProcessor processor;
  @Mock private Comic comic;
  @MockBean private PublisherRepository publisherRepository;

  @Test(expected = ComicVineAdaptorException.class)
  public void testProcessBadData() throws ComicVineAdaptorException {
    processor.process(BAD_DATA, comic);
  }

  @Test
  public void testProcess() throws ComicVineAdaptorException {
    Mockito.doNothing().when(comic).setPublisher(Mockito.anyString());

    processor.process(GOOD_DATA, comic);

    Mockito.verify(comic, Mockito.times(1)).setPublisher("DC Comics");
  }

  @Test
  public void testProcessWithImprint() throws ComicVineAdaptorException {
    Mockito.doNothing().when(comic).setPublisher(Mockito.anyString());
    Mockito.doNothing().when(comic).setImprint(Mockito.anyString());

    processor.process(IMPRINT_DATA, comic);

    Mockito.verify(comic, Mockito.times(1)).setPublisher("DC Comics");
    Mockito.verify(comic, Mockito.times(1)).setImprint("Vertigo");
  }
}
