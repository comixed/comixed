/*
 * ComixEd - A digital comic book library management application.
 * Copyright (C) 2017, Darryl L. Pierce
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

package org.comixed.library.loaders;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.StringTokenizer;

import javax.xml.stream.XMLInputFactory;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;

import org.comixed.library.model.Comic;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * * <code>ComicInfoEntryLoader</code> loads data from the ComicInfo.xml file
 * created by ComicRack.
 * 
 * @author Darryl L. Pierce
 */
@Component
public class ComicInfoEntryLoader implements
                                  EntryLoader
{
    private final Logger logger = LoggerFactory.getLogger(this.getClass());
    private final XMLInputFactory xmlInputFactory;

    public ComicInfoEntryLoader()
    {
        this.xmlInputFactory = XMLInputFactory.newInstance();
    }

    @Override
    public void loadContent(Comic comic, String filename, byte[] content) throws EntryLoaderException
    {
        try
        {
            this.loadXmlData(new ByteArrayInputStream(content), comic);
        }
        catch (final XMLStreamException error)
        {
            throw new EntryLoaderException(error);
        }
    }

    protected void loadXmlData(InputStream istream, Comic comic) throws XMLStreamException
    {
        final XMLStreamReader xmlInputReader = this.xmlInputFactory.createXMLStreamReader(istream);
        int publishedYear = -1;
        int publishedMonth = -1;

        while (xmlInputReader.hasNext())
        {
            if (xmlInputReader.isStartElement())
            {
                final String tagName = xmlInputReader.getLocalName();
                logger.info("Processing tag: " + tagName);
                switch (tagName)
                {
                    case "Publisher":
                        comic.setPublisher(xmlInputReader.getElementText());
                        break;
                    case "Series":
                        comic.setSeries(xmlInputReader.getElementText());
                        break;
                    case "Volume":
                        comic.setVolume(xmlInputReader.getElementText());
                        break;
                    case "Title":
                        comic.setTitle(xmlInputReader.getElementText());
                        break;
                    case "Number":
                        comic.setIssueNumber(xmlInputReader.getElementText());
                        break;
                    case "Summary":
                        comic.setSummary(xmlInputReader.getElementText());
                        break;
                    case "Notes":
                        comic.setNotes(xmlInputReader.getElementText());
                        break;
                    case "Year":
                        publishedYear = Integer.valueOf(xmlInputReader.getElementText());
                        break;
                    case "Month":
                        publishedMonth = Integer.valueOf(xmlInputReader.getElementText());
                        break;
                    case "Web":
                        break;
                    case "PageCount":
                        break;
                    case "Characters":
                        List<String> characters = commandSeparatedList(xmlInputReader.getElementText());
                        for (String character : characters)
                        {
                            comic.addCharacter(character);
                        }
                        break;
                    case "Teams":
                        List<String> teams = commandSeparatedList(xmlInputReader.getElementText());
                        for (String team : teams)
                        {
                            comic.addTeam(team);
                        }
                        break;
                    case "Locations":
                        List<String> locations = commandSeparatedList(xmlInputReader.getElementText());
                        for (String location : locations)
                        {
                            comic.addLocation(location);
                        }
                        break;
                    default:
                        logger.info("Unrecognized tag");
                        break;
                }
            }
            xmlInputReader.next();
        }
        // if we have the published year and/or month then set them
        if (publishedYear > -1)
        {
            if (publishedMonth > -1)
            {
                comic.setCoverDate(new Date(publishedYear, publishedMonth - 1, 1));
            }
            else
            {
                comic.setCoverDate(new Date(publishedYear, 0, 1));
            }
        }

    }

    private List<String> commandSeparatedList(String text)
    {
        List<String> result = new ArrayList<>();
        StringTokenizer tokens = new StringTokenizer(text, ",");

        while (tokens.hasMoreTokens())
        {
            result.add(tokens.nextToken().trim());
        }

        return result;
    }
}
