/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project.
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

package org.comixed.web.opds;

import org.comixed.model.library.Comic;
import org.comixed.model.library.Page;
import org.comixed.utils.FileTypeIdentifier;
import org.comixed.repositories.ComiXedUserRepository;
import org.comixed.repositories.ComicRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.*;
import java.text.ParseException;
import java.util.Optional;

/**
 * <code>OPDSController</code> provides the web interface for accessing the OPDS
 * feeds.
 *
 * @author Giao Phan
 * @author Darryl L. Pierce
 */
@RestController
public class OPDSController
{
    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    private ComiXedUserRepository userRepository;

    @Autowired
    private ComicRepository comicRepository;

    @Autowired
    private FileTypeIdentifier fileTypeIdentifier;

    @RequestMapping(value = "/opds/all",
            method = RequestMethod.GET, produces =
            {"application/atom+xml"})
    @CrossOrigin
    public OPDSFeed getAllComics() throws ParseException
    {
        return new OPDSAcquisitionFeed("/opds/all", "All Comics", this.comicRepository.findAll());
    }

    @RequestMapping(value = "/opds", method = RequestMethod.GET)
    @CrossOrigin
    public OPDSFeed getNavigationFeed() throws ParseException
    {

        return new OPDSNavigationFeed();
    }

    @RequestMapping(value = "/opds/feed/comics/{id}/download/{filename}", method = RequestMethod.GET)
    @CrossOrigin
    public ResponseEntity<InputStreamResource> downloadComic(@PathVariable("id") long id, @PathVariable("filename") String filename)
            throws FileNotFoundException,
                   IOException
    {
        this.logger.debug("Attempting to download comic: id={}", id);

        Optional<Comic> record = this.comicRepository.findById(id);

        if (!record.isPresent())
        {
            this.logger.error("No such comic");
            return null;
        }

        Comic comic = record.get();
        File file = new File(comic.getFilename());

        if (!file.exists() || !file.isFile())
        {
            this.logger.error("Missing or invalid comic file: {}", comic.getFilename());
            return null;
        }

        InputStreamResource resource = new InputStreamResource(new FileInputStream(file));

        return ResponseEntity.ok()
                .contentLength(file.length())
                .header("Content-Disposition", "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType(comic.getArchiveType()
                        .getMimeType()
                        .toString()))
                .body(resource);
    }

    @RequestMapping(value = "/opds/feed/comics/{id}/pages/{index}/{name}", method = RequestMethod.GET)
    @CrossOrigin
    public ResponseEntity<byte[]> getImageInComicByIndex(@PathVariable("id") long id, @PathVariable("index") int index, @PathVariable("name") String filename)
    {
        this.logger.debug("Getting the image for comic: id={} index={}", id, index);

        Optional<Comic> record = this.comicRepository.findById(id);

        if (record.isPresent()
                && (index < record.get()
                .getPageCount()))
        {
            Page page = record.get()
                    .getPage(index);
            byte[] content = page.getContent();
            String type = this.fileTypeIdentifier.typeFor(new ByteArrayInputStream(content)) + "/"
                    + this.fileTypeIdentifier.subtypeFor(new ByteArrayInputStream(content));
            this.logger.debug("Image {} mimetype: {}", filename, type);
            return ResponseEntity.ok()
                    .contentLength(content.length)
                    .header("Content-Disposition", "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.valueOf(type))
                    .body(content);
        }

        if (!record.isPresent())
        {
            this.logger.debug("Could now download page. No such comic: id={}", id);
        } else
        {
            this.logger.debug("No such page: index={} page count={}", index, record.get()
                    .getPageCount());
        }

        return null;
    }
}
