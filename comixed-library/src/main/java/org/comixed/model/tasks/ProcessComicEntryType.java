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

package org.comixed.model.tasks;

public enum ProcessComicEntryType {
    ADD_FILE_DELETE_PAGES_WITH_METADATA,
    ADD_FILE_DELETE_PAGES_WITHOUT_METADATA,
    ADD_FILE_WITH_METADATA,
    ADD_FILE_WITHOUT_METADATA;

    public static void setProcessTypeFor(final ProcessComicEntry entry,
                                         final boolean deleteBlockedPages,
                                         final boolean ignoreMetadata) {
        ProcessComicEntryType type;

        if (deleteBlockedPages) {
            if (ignoreMetadata) {
                type = ADD_FILE_DELETE_PAGES_WITHOUT_METADATA;
            } else {
                type = ADD_FILE_DELETE_PAGES_WITH_METADATA;
            }
        } else {
            if (ignoreMetadata) {
                type = ADD_FILE_WITHOUT_METADATA;
            } else {
                type = ADD_FILE_WITH_METADATA;
            }
        }
        entry.setProcessType(type);
    }
}
