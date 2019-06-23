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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.util.StringTokenizer;

/**
 * <code>PathReplacement</code> handles processing comic paths, applying replacement rules.
 *
 * @author Darryl L. Pierce
 */
public class PathReplacement {
    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    String source;
    String destination;

    public PathReplacement(String rule) {
        if (rule.contains("=")) {
            StringTokenizer tokens = new StringTokenizer(rule, "=");
            this.source = tokens.nextToken();
            this.destination = tokens.nextToken();

            if (this.source.isEmpty()) {
                throw new RuntimeException("missing source path name");
            }

            if (this.source.endsWith(File.separator)) {
                this.source = this.source.substring(0, this.source.length() - 1);
            }
            if (this.destination.endsWith(File.separator)) {
                this.destination = this.destination.substring(0, this.destination.length() - 1);
            }
            this.logger.debug("Created replacement rule: {} => {}", this.source, this.destination);
        } else {
            throw new RuntimeException("malformed path replacement rule:" + rule);
        }
    }

    /**
     * Returns if the provided file has a directory that matches the replacement rule.
     *
     * @param path the comic file path
     * @return true if the path is a match
     */
    public boolean isMatch(String path) {
        this.logger.debug("Comparing: path={} source={}", path, this.source);
        boolean result = path.startsWith(this.source);
        this.logger.debug("Returning {}", result);
        return result;
    }

    /**
     * Returns a path for the given file with the root path replaced.
     *
     * @param file the file path
     * @return the modified path
     */
    public String getReplacement(String file) {
        String result = this.destination + file.substring(this.source.length());
        this.logger.debug("Replaced: {} => {}", file, this.destination);

        return result;
    }
}
