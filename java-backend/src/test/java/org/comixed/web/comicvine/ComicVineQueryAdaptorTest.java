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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertSame;

import java.io.IOException;
import java.util.List;

import org.comixed.web.model.ComicVolume;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.runners.MockitoJUnitRunner;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;

@RunWith(MockitoJUnitRunner.class)
public class ComicVineQueryAdaptorTest
{
    private static final byte[] TEST_CONTENT = "{}".getBytes();
    private static final byte[] TEST_RESULT = "The results".getBytes();

    @InjectMocks
    private ComicVineQueryAdaptor adaptor;

    @Mock
    private ObjectMapper objectMapper;

    @Mock
    private ComicVineVolumeQueryResult volumeResult;

    @Mock
    private List<ComicVolume> comicVolumeList;

    @Test
    public void testTransformNoContent() throws ComicVineAdaptorException
    {
        byte[] result = adaptor.execute(null);

        assertNotNull(result);
        assertEquals(0, result.length);
    }

    @Test(expected = ComicVineAdaptorException.class)
    public void testExecuteWithExceptionWhenParsing() throws JsonParseException,
                                                      JsonMappingException,
                                                      IOException,
                                                      ComicVineAdaptorException
    {
        Mockito.when(objectMapper.readValue(Mockito.any(byte[].class), Mockito.any(Class.class)))
               .thenThrow(new IOException("Expected"));

        try
        {
            adaptor.execute(TEST_CONTENT);
        }
        finally
        {
            Mockito.verify(objectMapper, Mockito.times(1)).readValue(TEST_CONTENT, ComicVineVolumeQueryResult.class);
        }
    }

    @Test(expected = ComicVineAdaptorException.class)
    public void testExecuteWithExceptionWhileTransforming() throws IOException, ComicVineAdaptorException
    {
        Mockito.when(objectMapper.readValue(Mockito.any(byte[].class), Mockito.any(Class.class)))
               .thenReturn(volumeResult);
        Mockito.when(volumeResult.transform()).thenReturn(comicVolumeList);
        Mockito.when(objectMapper.writeValueAsBytes(Mockito.any(List.class))).thenThrow(JsonProcessingException.class);

        try
        {
            adaptor.execute(TEST_CONTENT);
        }
        finally
        {
            Mockito.verify(objectMapper, Mockito.times(1)).readValue(TEST_CONTENT, ComicVineVolumeQueryResult.class);
            Mockito.verify(volumeResult, Mockito.times(1)).transform();
            Mockito.verify(objectMapper, Mockito.times(1)).writeValueAsBytes(comicVolumeList);
        }
    }

    @Test
    public void testExecute() throws JsonParseException, JsonMappingException, IOException, ComicVineAdaptorException
    {
        Mockito.when(objectMapper.readValue(Mockito.any(byte[].class), Mockito.any(Class.class)))
               .thenReturn(volumeResult);
        Mockito.when(volumeResult.transform()).thenReturn(comicVolumeList);
        Mockito.when(objectMapper.writeValueAsBytes(Mockito.any())).thenReturn(TEST_RESULT);

        byte[] result = adaptor.execute(TEST_CONTENT);

        assertSame(TEST_RESULT, result);

        Mockito.verify(objectMapper, Mockito.times(1)).readValue(TEST_CONTENT, ComicVineVolumeQueryResult.class);
    }
}
