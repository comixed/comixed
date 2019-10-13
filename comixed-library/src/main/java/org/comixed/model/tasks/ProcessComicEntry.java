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

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;
import org.comixed.model.library.Comic;
import org.comixed.views.View.ComicDetails;

import javax.persistence.*;
import java.util.Date;

@Entity
@Table(name = "process_comic_entries")
public class ProcessComicEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("id")
    @JsonView({ComicDetails.class})
    private Long id;

    @OneToOne
    @JoinColumn(name = "comic_id",
                nullable = false,
                updatable = false)
    private Comic comic;

    @Enumerated(EnumType.STRING)
    @Column(name = "process_type",
            nullable = false,
            updatable = false)
    private ProcessComicEntryType processType;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "created",
            nullable = false,
            updatable = false)
    private Date created = new Date();

    public ProcessComicEntry() { }

    public Long getId() { return id; }

    public Comic getComic() { return comic; }

    public void setComic(final Comic comic) { this.comic = comic; }

    public ProcessComicEntryType getProcessType() { return processType; }

    public void setProcessType(final ProcessComicEntryType processType) { this.processType = processType; }

    public Date getCreated() { return created; }

    public void setCreated(final Date created) { this.created = created; }
}
