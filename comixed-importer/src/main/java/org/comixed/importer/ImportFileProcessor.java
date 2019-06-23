/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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

package org.comixed.importer;

import org.comixed.importer.adaptors.ComicFileImportAdaptor;
import org.comixed.importer.adaptors.ComicRackBackupAdaptor;
import org.comixed.importer.adaptors.ImportAdaptorException;
import org.comixed.library.model.Comic;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

/**
 * <code>ImportFileProcessor</code> provides a means for processing an import file.
 *
 * @author Darryl L. Pierce
 */
@Component
@ConfigurationProperties(value = "processor.file.import")
public class ImportFileProcessor {
    private final Logger logger = LoggerFactory.getLogger(this.getClass());
    protected List<PathReplacement> replacements = new ArrayList<>();
    @Autowired
    private ComicRackBackupAdaptor backupAdaptor;
    @Autowired
    private ComicFileImportAdaptor importAdaptor;

    public void setReplacements(List<String> replacements) {
        this.logger.debug("Processing {} replacement rules", replacements.size());
        for (String rule : replacements) {
            this.replacements.add(new PathReplacement(rule));
        }
    }

    /**
     * Starts processing the file.
     *
     * @throws ProcessorException if a processing error occurs
     */
    public void process(String source) throws ProcessorException {
        this.logger.debug("Beginning import: file={}", source);
        if (source == null) {
            throw new ProcessorException("missing source");
        }

        File file = new File(source);

        if (!file.exists()) {
            throw new ProcessorException("file not found:" + source);
        }
        if (!file.isFile()) {
            throw new ProcessorException("source is a directory:" + source);
        }

        try {
            this.logger.debug("Loading comics from source file");
            List<Comic> comics = this.backupAdaptor.load(file);

            this.logger.debug("Importing {} comic(s)", comics.size());
            this.importAdaptor.importComics(comics, this.replacements);
        } catch (ImportAdaptorException error) {
            throw new ProcessorException("failed to load entries", error);
        }
    }
}
