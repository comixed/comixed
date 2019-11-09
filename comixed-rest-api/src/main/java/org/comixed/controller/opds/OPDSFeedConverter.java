/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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

package org.comixed.controller.opds;

import java.io.IOException;
import java.util.List;

import javax.xml.stream.XMLOutputFactory;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamWriter;

import org.comixed.model.opds.OPDSEntry;
import org.comixed.model.opds.OPDSLink;
import org.springframework.http.HttpInputMessage;
import org.springframework.http.HttpOutputMessage;
import org.springframework.http.MediaType;
import org.springframework.http.converter.AbstractHttpMessageConverter;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.http.converter.HttpMessageNotWritableException;

/**
 * <code>OPDSFeedConverter</code> provides a tpe for converting an instance of
 * {@link OPDSFeed} into an instance of {@link HttpOutputMessage}.
 *
 * @author Giao Phan
 * @author Darryl L. Pierce
 *
 */
public class OPDSFeedConverter extends AbstractHttpMessageConverter<OPDSFeed>
{

    public OPDSFeedConverter()
    {
        super(MediaType.APPLICATION_ATOM_XML);
    }

    private void _writeLinks(XMLStreamWriter writer, List<OPDSLink> links) throws XMLStreamException
    {
        for (OPDSLink link : links)
        {
            writer.writeStartElement("link");
            writer.writeAttribute("type", link.getType());
            writer.writeAttribute("rel", link.getRel());
            writer.writeAttribute("href", link.getHRef());
            writer.writeEndElement();
        }
    }

    @Override
    protected OPDSFeed readInternal(Class<? extends OPDSFeed> clazz,
                                    HttpInputMessage inputMessage) throws IOException, HttpMessageNotReadableException
    {
        throw new HttpMessageNotReadableException("Serializing to a OPDSFeed not supported yet");
    }

    @Override
    protected boolean supports(Class<?> clazz)
    {
        return OPDSFeed.class.isAssignableFrom(clazz);
    }

    @Override
    protected void writeInternal(OPDSFeed feed, HttpOutputMessage outputMessage) throws IOException,
                                                                                 HttpMessageNotWritableException
    {
        try
        {
            XMLOutputFactory outputFactory = XMLOutputFactory.newInstance();
            XMLStreamWriter writer = outputFactory.createXMLStreamWriter(outputMessage.getBody());
            writer.writeStartDocument("utf-8", "1.0");
            writer.writeStartElement("feed");
            writer.writeDefaultNamespace("http://www.w3.org/2005/Atom");
            writer.writeNamespace("opds", "http://opds-spec.org/2010/catalog");

            writer.writeStartElement("id");
            writer.writeCharacters(feed.getId());
            writer.writeEndElement();

            writer.writeStartElement("title");
            writer.writeCharacters(feed.getTitle());
            writer.writeEndElement();

            writer.writeStartElement("updated");
            writer.writeCharacters(feed.getUpdated().toString());
            writer.writeEndElement();

            this._writeLinks(writer, feed.getLinks());

            for (OPDSEntry entry : feed.getEntries())
            {
                writer.writeStartElement("entry");

                writer.writeStartElement("title");
                writer.writeCharacters(entry.getTitle());
                writer.writeEndElement();

                writer.writeStartElement("id");
                writer.writeCharacters(entry.getId());
                writer.writeEndElement();

                writer.writeStartElement("updated");
                writer.writeCharacters(entry.getUpdated().toString());
                writer.writeEndElement();

                writer.writeStartElement("content");
                writer.writeAttribute("type", "html");
                writer.writeCharacters(entry.getContent());
                writer.writeEndElement();

                writer.writeStartElement("author");
                for (String author : entry.getAuthors())
                {
                    writer.writeStartElement("name");
                    writer.writeCharacters(author);
                    writer.writeEndElement();
                }
                writer.writeEndElement();

                this._writeLinks(writer, entry.getLinks());

                writer.writeEndElement(); // entry
            }

            writer.writeEndDocument();
            writer.close();
        }
        catch (Exception e)
        {

        }
    }
}
