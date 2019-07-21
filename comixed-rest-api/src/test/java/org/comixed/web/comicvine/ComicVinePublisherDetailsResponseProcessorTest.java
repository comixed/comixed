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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

package org.comixed.web.comicvine;

import org.comixed.model.library.Comic;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import com.fasterxml.jackson.databind.ObjectMapper;

@RunWith(SpringRunner.class)
@SpringBootTest(classes =
{ComicVinePublisherDetailsResponseProcessor.class,
 ObjectMapper.class})
public class ComicVinePublisherDetailsResponseProcessorTest
{
    private static final byte[] BAD_DATA = "This is not a response".getBytes();
    private static final byte[] GOOD_DATA = "{\"error\":\"OK\",\"limit\":1,\"offset\":0,\"number_of_page_results\":1,\"number_of_total_results\":1,\"status_code\":1,\"results\":{\"name\":\"DC Comics\"},\"version\":\"1.0\"}".getBytes();
    private static final byte[] IMPRINT_DATA = "{\"error\":\"OK\",\"limit\":1,\"offset\":0,\"number_of_page_results\":1,\"number_of_total_results\":1,\"status_code\":1,\"results\":{\"name\":\"Vertigo\"},\"version\":\"1.0\"}".getBytes();

    @Autowired
    private ComicVinePublisherDetailsResponseProcessor processor;

    @Mock
    private Comic comic;

    @Test(expected = ComicVineAdaptorException.class)
    public void testProcessBadData() throws ComicVineAdaptorException
    {
        processor.process(BAD_DATA, comic);
    }

    @Test
    public void testProcess() throws ComicVineAdaptorException
    {
        Mockito.doNothing().when(comic).setPublisher(Mockito.anyString());

        processor.process(GOOD_DATA, comic);

        Mockito.verify(comic, Mockito.times(1)).setPublisher("DC Comics");
    }

    @Test
    public void testProcessWithImprint() throws ComicVineAdaptorException
    {
        Mockito.doNothing().when(comic).setPublisher(Mockito.anyString());
        Mockito.doNothing().when(comic).setImprint(Mockito.anyString());

        processor.process(IMPRINT_DATA, comic);

        Mockito.verify(comic, Mockito.times(1)).setPublisher("DC Comics");
        Mockito.verify(comic, Mockito.times(1)).setImprint("Vertigo");
    }
}
