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

package org.comixed.library.adaptors;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.GregorianCalendar;
import java.util.List;
import java.util.StringTokenizer;

import javax.xml.stream.XMLInputFactory;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;

import org.comixed.library.loaders.EntryLoader;
import org.comixed.library.loaders.EntryLoaderException;
import org.comixed.library.model.Comic;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * * <code>ComicInfoEntryAdaptor</code> loads data from the ComicInfo.xml file
 * created by ComicRack.
 *
 * @author Darryl L. Pierce
 */
@Component
public class ComicInfoEntryAdaptor implements
                                   EntryLoader
{
    private final Logger logger = LoggerFactory.getLogger(this.getClass());
    private final XMLInputFactory xmlInputFactory;

    public ComicInfoEntryAdaptor()
    {
        this.xmlInputFactory = XMLInputFactory.newInstance();
    }

    private String arrayToString(List<String> items)
    {
        if ((items == null) || items.isEmpty()) return null;

        StringBuffer result = new StringBuffer();

        for (String item : items)
        {
            if (result.length() > 0)
            {
                result.append(",");
            }
            result.append(item);
        }
        return result.toString();
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
                this.logger.debug("Processing tag: " + tagName);
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
                        List<String> characters = this.commandSeparatedList(xmlInputReader.getElementText());
                        for (String character : characters)
                        {
                            comic.addCharacter(character);
                        }
                        break;
                    case "Teams":
                        List<String> teams = this.commandSeparatedList(xmlInputReader.getElementText());
                        for (String team : teams)
                        {
                            comic.addTeam(team);
                        }
                        break;
                    case "Locations":
                        List<String> locations = this.commandSeparatedList(xmlInputReader.getElementText());
                        for (String location : locations)
                        {
                            comic.addLocation(location);
                        }
                        break;
                    default:
                        this.logger.debug("Unrecognized tag");
                        break;
                }
            }
            xmlInputReader.next();
        }
        // if we have the published year and/or month then set them
        if (publishedYear > -1)
        {
            GregorianCalendar gc = (publishedMonth > -1) ? new GregorianCalendar(publishedYear, publishedMonth - 1, 1)
                                                         : new GregorianCalendar(publishedYear, 0, 1);
            comic.setCoverDate(gc.getTime());
        }

    }

    /**
     * Writes the content of the provided comic as a ComicInfo.xml file to the
     * provided output stream.
     *
     * @param comic
     *            the comic
     * @return the content of the file
     * @throws IOException
     *             if an error occurs
     */
    public byte[] saveContent(Comic comic) throws IOException
    {
        this.logger.debug("Generating comic info data from comic");
        ByteArrayOutputStream result = new ByteArrayOutputStream();
        PrintWriter writer = new PrintWriter(new OutputStreamWriter(result));

        writer.write("<?xml version=\"1.0\"?><ComicInfo xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\"  xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">");
        this.writeEntry(writer, "Publisher", comic.getPublisher());
        this.writeEntry(writer, "Series", comic.getSeries());
        this.writeEntry(writer, "Volume", comic.getVolume());
        this.writeEntry(writer, "Number", comic.getIssueNumber());
        this.writeEntry(writer, "Title", comic.getTitle());
        this.writeEntry(writer, "Summary", comic.getSummary());
        this.writeEntry(writer, "Notes", comic.getNotes());

        if (comic.getCoverDate() != null)
        {
            Calendar gc = Calendar.getInstance();
            gc.setTime(comic.getCoverDate());
            this.writeEntry(writer, "Year", String.valueOf(gc.get(Calendar.YEAR)));
            this.writeEntry(writer, "Month", String.valueOf(gc.get(Calendar.MONTH) + 1));
        }
        this.writeEntry(writer, "PageCount", String.valueOf(comic.getPageCount()));
        this.writeEntry(writer, "Characters", this.arrayToString(comic.getCharacters()));
        this.writeEntry(writer, "Teams", this.arrayToString(comic.getTeams()));
        this.writeEntry(writer, "Locations", this.arrayToString(comic.getLocations()));
        writer.write("</ComicInfo>");
        writer.flush();

        return result.toByteArray();

    }

    private void writeEntry(PrintWriter writer, String tagName, String value)
    {
        if (value != null)
        {
            writer.write(MessageFormat.format("<{0}>{1}</{0}>", tagName, value));
        }
    }
}
